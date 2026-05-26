const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const isVercel = !!process.env.VERCEL || !!process.env.BLOB_READ_WRITE_TOKEN;

async function uploadFile(buffer, originalname, mimetype) {
  const ext = path.extname(originalname) || '.jpg';
  const filename = `${uuidv4()}${ext}`;

  if (isVercel) {
    const { put } = require('@vercel/blob');
    const blob = await put(`botanica/${filename}`, buffer, {
      access: 'public',
      contentType: mimetype,
    });
    return blob.url;
  } else {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buffer);
    return `/uploads/${filename}`;
  }
}

async function deleteFile(fileUrl) {
  try {
    if (isVercel && fileUrl?.startsWith('https://')) {
      const { del } = require('@vercel/blob');
      await del(fileUrl);
    } else if (fileUrl?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch { /* ignore delete errors */ }
}

// Returns base64 from either a local path or fetches a remote URL
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
