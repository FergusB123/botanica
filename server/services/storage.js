const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

async function uploadFile(buffer, originalname, mimetype) {
  const ext = path.extname(originalname) || '.jpg';
  const filename = `${uuidv4()}${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    // Vercel Blob — pass token explicitly so it doesn't have to find it itself
    const { put } = require('@vercel/blob');
    console.log('[storage] Uploading to Vercel Blob:', filename);
    const blob = await put(`botanica/${filename}`, buffer, {
      access: 'public',
      contentType: mimetype,
      token,
    });
    console.log('[storage] Blob URL:', blob.url);
    return blob.url;
  } else {
    // Local disk (dev without Blob token)
    console.log('[storage] BLOB_READ_WRITE_TOKEN not set — saving to local disk');
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buffer);
    return `/uploads/${filename}`;
  }
}

async function deleteFile(fileUrl) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token && fileUrl?.startsWith('https://')) {
      const { del } = require('@vercel/blob');
      await del(fileUrl, { token });
    } else if (fileUrl?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch { /* ignore delete errors */ }
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
