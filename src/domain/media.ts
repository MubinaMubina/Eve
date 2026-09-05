export type PostMedia = {
  kind: "image" | "video";
  uri: string;
  mimeType: string;
  width: number;
  height: number;
  bytes: number;
};

// Local-preview limits only. Production limits need server-side enforcement.
export const previewMediaLimits = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};
const supportedTypes = {
  image: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
};

export function validateMedia(media: PostMedia) {
  if (!supportedTypes[media.kind]?.includes(media.mimeType))
    throw new Error("Choose a supported photo or video file.");
  if (!/^(blob:|file:\/\/|content:\/\/)/.test(media.uri))
    throw new Error("Choose media from your device.");
  if (
    !Number.isFinite(media.bytes) ||
    media.bytes <= 0 ||
    media.bytes > previewMediaLimits[media.kind]
  ) {
    throw new Error(
      media.kind === "image"
        ? "Choose a photo under 10 MB."
        : "Choose a video under 50 MB.",
    );
  }
  if (![media.width, media.height].every((n) => Number.isFinite(n) && n > 0))
    throw new Error("This file could not be read. Try another photo or video.");
}
