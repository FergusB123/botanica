const Anthropic = require('@anthropic-ai/sdk');

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === 'your_anthropic_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }
  return new Anthropic({ apiKey: key });
}

const MODEL = 'claude-sonnet-4-6';

function parseJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in Claude response');
  return JSON.parse(match[0]);
}

// imageData: array of { buffer: Buffer, mimetype: string }
async function identifyPlant(imageData) {
  const imageBlocks = imageData.map(({ buffer, mimetype }) => ({
    type: 'image',
    source: { type: 'base64', media_type: mimetype, data: buffer.toString('base64') }
  }));

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        ...imageBlocks,
        {
          type: 'text',
          text: `Identify this plant and return ONLY a JSON object with these exact fields:
{
  "common_name": "string",
  "scientific_name": "string",
  "family": "string",
  "watering_frequency_days": number,
  "sunlight": "string e.g. Bright indirect / Full sun / Low light",
  "temp_min": number (celsius),
  "temp_max": number (celsius),
  "humidity": "Low / Medium / High",
  "difficulty": "Easy / Medium / Hard / Expert",
  "toxic": boolean,
  "growth_rate": "Slow / Moderate / Fast",
  "typical_lifespan": "string",
  "care_tips": ["tip1", "tip2", "tip3"],
  "fun_fact": "string",
  "confidence": "High / Medium / Low"
}
Return ONLY valid JSON, no other text.`
        }
      ]
    }]
  });

  return parseJSON(response.content[0].text);
}

// imageData: { buffer: Buffer, mimetype: string }
async function healthCheck(imageData, plantName, symptoms) {
  const symptomsText = symptoms ? `The owner reports: ${symptoms}` : '';
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: imageData.mimetype, data: imageData.buffer.toString('base64') } },
        {
          type: 'text',
          text: `This is a photo of a ${plantName}. ${symptomsText}
Assess the plant's health and return ONLY this JSON:
{
  "health_score": number (1-10),
  "overall_status": "string",
  "issues": [{"issue": "string", "description": "string", "severity": "Low/Medium/High"}],
  "diagnosis": "string (2-3 sentence paragraph)",
  "recommendations": ["action1", "action2", "action3"],
  "urgency": "Healthy / Monitor / Urgent",
  "positive_signs": ["string"]
}
Return ONLY valid JSON.`
        }
      ]
    }]
  });
  return parseJSON(response.content[0].text);
}

async function getPropagationGuide(plantName, scientificName) {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Generate a propagation guide for ${plantName}${scientificName ? ` (${scientificName})` : ''}.
Return ONLY this JSON:
{
  "best_methods": ["string"],
  "best_season": "string",
  "difficulty": "Easy / Medium / Hard",
  "time_to_root": "string",
  "steps": [{"step": number, "title": "string", "description": "string", "tip": "string or null"}],
  "success_tips": ["string"],
  "common_mistakes": ["string"],
  "supplies_needed": ["string"]
}
Return ONLY valid JSON.`
    }]
  });
  return parseJSON(response.content[0].text);
}

async function getSeasonalTip(month) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Write a seasonal plant care tip for ${months[month - 1]} (Northern Hemisphere).
Return ONLY this JSON: {"title": "string (max 8 words)", "tip": "string (2-3 sentences)", "emoji": "string"}
Return ONLY valid JSON.`
      }]
    });
    return parseJSON(response.content[0].text);
  } catch {
    return { title: 'Seasonal Care Reminder', tip: 'Check your plants regularly and adjust watering as the season changes.', emoji: '🌿' };
  }
}

module.exports = { identifyPlant, healthCheck, getPropagationGuide, getSeasonalTip };
