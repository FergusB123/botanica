const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

async function uploadFile(buffer, originalname, mimetype) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    // Cloudinary unsigned upload — no API secret needed
    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${base64}`;

    const body = new URLSearchParams();
    body.append('file', dataURI);
    body.append('upload_preset', uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Cloudinary upload failed: ${err}`);
    }

    const data = await res.json();
    console.log('[storage] Uploaded to Cloudinary:', data.secure_url);
    return data.secure_url;

  } else {
    // Local disk fallback for development
    console.log('[storage] No cloud storage configured — saving to local disk');
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = `${uuidv4()}${path.extname(originalname) || '.jpg'}`;
    fs.writeFileSync(path.join(dir, filename), buffer);
    return `/uploads/${filename}`;
  }
}

async function deleteFile(fileUrl) {
  // Cloudinary deletion requires signed requests — skip for now
  // Local files: clean up if needed
  try {
    if (fileUrl?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch { /* ignore */ }
}

async function fileToBase64(fileUrlOrPath) {
  if (fileUrlOrPath.startsWith('http')) {
    const res = await fetch(fileUrlOrPath);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString('base64');
  } else {
    const absPath = fileUrlOrPath.startsWith('/')
      ? path.join(__dirname, '..', fileUrlOrPath)
      : fileUrlOrPath;
    return fs.readFileSync(absPath).toString('base64');
  }
}

module.exports = { uploadFile, deleteFile, fileToBase64 };
