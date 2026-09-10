import path from 'path';

// Railway exposes the mount path of an attached Volume at runtime. DATA_DIR still
// takes precedence so other hosts (and local development) can choose their own path.
// Keeping this outside public/ means uploads are served through an API route instead
// of relying on files added to the build-time public directory.
export function getDataDir() {
  return process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'data');
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
