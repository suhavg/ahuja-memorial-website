import path from 'path';

// On Railway, set DATA_DIR to the path of the mounted Volume (for example /data).
// Keeping this outside public/ means uploads are served through an API route instead
// of relying on files added to the build-time public directory.
export function getDataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), 'data');
}

export function getUploadDir() {
  return path.join(getDataDir(), 'uploads');
}

export function uploadUrl(fileName: string) {
  return `/api/uploads/${fileName}`;
}

export function isSafeUploadFileName(fileName: string) {
  return /^[a-zA-Z0-9-]+\.(?:jpe?g|png|webp)$/.test(fileName);
}
