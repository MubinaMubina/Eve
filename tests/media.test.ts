import { describe, expect, it } from "vitest";
import {
  PostMedia,
  previewMediaLimits,
  validateMedia,
} from "../src/domain/media";
import {
  canRead,
  changePrivacy,
  createPost,
  deletePost,
} from "../src/domain/model";
import { createDemoWorld, demoMemberId as me } from "../src/demo/fixtures";

const image: PostMedia = {
  kind: "image",
  uri: "blob:sample-photo",
  mimeType: "image/png",
  width: 320,
  height: 240,
  bytes: 1000,
};
const video: PostMedia = {
  ...image,
  kind: "video",
  uri: "blob:sample-video",
  mimeType: "video/mp4",
};
const input = {
  id: "media-post",
  text: "",
  anonymous: false,
  audience: "followers" as const,
  createdAt: "2026-09-06T12:00:00Z",
};

describe("image and video posts", () => {
  for (const media of [image, video]) {
    it(`publishes a ${media.kind} without a caption and keeps the audience`, () => {
      const w = createPost(createDemoWorld(), me, { ...input, media });
      expect(w.posts[0].text).toBe("");
      expect(w.posts[0].media).toEqual(media);
      expect(canRead(w, "demo-noor", w.posts[0])).toBe(true);
      expect(canRead(w, "demo-sana", w.posts[0])).toBe(false);
      expect(canRead(w, "demo-pending", w.posts[0])).toBe(false);
    });
    it(`preserves anonymous ${media.kind} visibility through privacy changes`, () => {
      let w = createPost(createDemoWorld(), me, {
        ...input,
        media,
        anonymous: true,
        audience: "everyone",
        authorNumber: 3545,
      });
      w = changePrivacy(w, me, "public");
      w = changePrivacy(w, me, "private");
      expect(w.posts[0].audience).toBe("everyone");
      expect(w.posts[0].media).toEqual(media);
      w.blocks.push({ blocker: "demo-sana", blocked: me });
      expect(canRead(w, "demo-sana", w.posts[0])).toBe(false);
      expect(
        deletePost(w, me, input.id).posts.some((p) => p.id === input.id),
      ).toBe(false);
    });
    it(`denies oversized ${media.kind} and rejects missing/corrupt metadata`, () => {
      expect(() =>
        validateMedia({ ...media, bytes: previewMediaLimits[media.kind] + 1 }),
      ).toThrow();
      expect(() => validateMedia({ ...media, width: 0 })).toThrow(
        "could not be read",
      );
      expect(() => validateMedia({ ...media, height: NaN })).toThrow(
        "could not be read",
      );
      expect(() => validateMedia({ ...media, bytes: 0 })).toThrow();
    });
  }
  it("still rejects an empty post, long captions, remote media and type mismatches", () => {
    expect(() => createPost(createDemoWorld(), me, input)).toThrow();
    expect(() =>
      createPost(createDemoWorld(), me, {
        ...input,
        text: "x".repeat(2001),
        media: image,
      }),
    ).toThrow();
    expect(() =>
      validateMedia({ ...image, uri: "https://example.com/photo.png" }),
    ).toThrow("from your device");
    expect(() => validateMedia({ ...image, mimeType: "video/mp4" })).toThrow(
      "supported",
    );
  });
});
