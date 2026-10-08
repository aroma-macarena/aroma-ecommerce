const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(
  /\/+$/,
  "",
);

export function getMediaUrl(objectKey: string | null) {
  if (!mediaBaseUrl || !objectKey) {
    return null;
  }

  return `${mediaBaseUrl}/${objectKey.replace(/^\/+/, "")}`;
}
