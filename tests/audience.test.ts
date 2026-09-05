import { describe, expect, it } from "vitest";
import { createDemoWorld, demoMemberId as me } from "../src/demo/fixtures";
import {
  Audience,
  Member,
  Post,
  canRead,
  changePrivacy,
  createPost,
  defaultAudience,
  deletePost,
  feedPosts,
} from "../src/domain/model";

const post = (audience: Audience = "everyone"): Post => ({
  id: "new",
  authorId: "demo-noor",
  text: "Hello",
  anonymous: false,
  audience,
  circleId: audience === "circle" ? "noor-close-friends" : undefined,
  createdAt: "2026-09-06T12:00:00Z",
});

describe("mandatory access gates", () => {
  for (const audience of [
    "everyone",
    "followers",
    "mutuals",
    "circle",
  ] as Audience[]) {
    for (const status of [
      "pending",
      "suspended",
      "banned",
      "deleting",
    ] as Member["status"][]) {
      it(`denies ${status} viewers for ${audience}`, () => {
        const w = createDemoWorld();
        w.members.find((m) => m.id === me)!.status = status;
        expect(canRead(w, me, post(audience))).toBe(false);
      });
    }
    it(`requires admission and eligibility for ${audience}, including owners`, () => {
      for (const key of ["admitted", "eligible"] as const) {
        const w = createDemoWorld();
        w.members.find((m) => m.id === me)![key] = false;
        expect(canRead(w, me, post(audience))).toBe(false);
        expect(canRead(w, me, { ...post(audience), authorId: me })).toBe(false);
      }
    });
    it(`checks both block directions before ${audience}`, () => {
      for (const reverse of [false, true]) {
        const w = createDemoWorld();
        w.blocks.push({
          blocker: reverse ? "demo-noor" : me,
          blocked: reverse ? me : "demo-noor",
        });
        expect(canRead(w, me, post(audience))).toBe(false);
      }
    });
    it(`denies unavailable authors for ${audience}`, () => {
      const w = createDemoWorld();
      w.members.find((m) => m.id === "demo-noor")!.status = "suspended";
      expect(canRead(w, me, post(audience))).toBe(false);
    });
  }
  it("only established follows and mutual follows grant restricted access", () => {
    const w = createDemoWorld();
    expect(canRead(w, me, post("mutuals"))).toBe(true);
    w.follows = w.follows.filter((e) => e.follower !== "demo-noor");
    expect(canRead(w, me, post("mutuals"))).toBe(false);
    expect(canRead(w, me, post("followers"))).toBe(true);
    w.follows = [];
    expect(canRead(w, me, post("followers"))).toBe(false);
  });
  it("circle changes apply to historical posts without changing them", () => {
    const w = createDemoWorld();
    const p = post("circle");
    expect(canRead(w, me, p)).toBe(true);
    w.circles[1].members = [];
    expect(canRead(w, me, p)).toBe(false);
    w.circles[1].members.push(me);
    expect(canRead(w, me, p)).toBe(true);
  });
});

describe("posting and privacy", () => {
  it("derives defaults from account privacy", () => {
    expect(defaultAudience("private")).toBe("followers");
    expect(defaultAudience("public")).toBe("everyone");
  });
  it("permits an app-wide named override from a private account", () => {
    const w = createPost(createDemoWorld(), me, post());
    expect(w.posts[0].audience).toBe("everyone");
    expect(w.members[0].privacy).toBe("private");
    expect(defaultAudience(w.members[0].privacy)).toBe("followers");
  });
  it("keeps anonymous posts app-wide and circle posts unchanged on privacy switches", () => {
    let w = createDemoWorld();
    w.posts = [
      post("everyone"),
      post("followers"),
      post("mutuals"),
      { ...post("circle"), circleId: "your-close-friends" },
      { ...post(), anonymous: true, authorNumber: 1234 },
    ].map((p, i) => ({ ...p, id: `owned-${i}`, authorId: me }));
    w = changePrivacy(w, me, "public");
    expect(w.posts.map((p) => p.audience)).toEqual([
      "everyone",
      "everyone",
      "everyone",
      "circle",
      "everyone",
    ]);
    w = changePrivacy(w, me, "private");
    expect(w.posts.map((p) => p.audience)).toEqual([
      "followers",
      "followers",
      "followers",
      "circle",
      "everyone",
    ]);
    expect(changePrivacy(w, me, "private")).toBe(w);
  });
  it("preserves narrower audiences on public to private", () => {
    const w = createDemoWorld();
    w.members[0].privacy = "public";
    w.posts = [{ ...post("mutuals"), authorId: me }];
    expect(changePrivacy(w, me, "private").posts[0].audience).toBe("mutuals");
  });
  it("rejects restricted anonymity, foreign circles, duplicate aliases and empty text", () => {
    const w = createDemoWorld();
    expect(() =>
      createPost(w, me, {
        ...post("followers"),
        anonymous: true,
        authorNumber: 3333,
      }),
    ).toThrow();
    expect(() => createPost(w, me, post("circle"))).toThrow();
    expect(() =>
      createPost(w, me, { ...post(), anonymous: true, authorNumber: 4827 }),
    ).toThrow();
    expect(() => createPost(w, me, { ...post(), text: "  " })).toThrow();
    expect(() => createPost(w, "demo-pending", post())).toThrow();
  });
  it("does not permit another author deletion", () => {
    const w = createDemoWorld();
    expect(() => deletePost(w, me, "seed-1")).toThrow();
    const own = createPost(w, me, post());
    expect(deletePost(own, me, "new").posts).toEqual(w.posts);
  });
});

describe("feed separation", () => {
  it("keeps anonymous and restricted posts out of Community", () => {
    expect(
      feedPosts(createDemoWorld(), me, "community").every(
        (p) => !p.anonymous && p.audience === "everyone",
      ),
    ).toBe(true);
  });
  it("includes allowed close-friends posts in Following but no anonymous posts", () => {
    const posts = feedPosts(createDemoWorld(), me, "following");
    expect(posts.some((p) => p.audience === "circle")).toBe(true);
    expect(posts.every((p) => !p.anonymous)).toBe(true);
  });
  it("keeps only anonymous posts in Anonymous and uses an ID tiebreaker", () => {
    const w = createDemoWorld();
    w.posts = [
      { ...post(), anonymous: true, authorNumber: 123, id: "a" },
      { ...post(), anonymous: true, authorNumber: 124, id: "b" },
    ];
    expect(feedPosts(w, me, "anonymous").map((p) => p.id)).toEqual(["b", "a"]);
    expect(feedPosts(w, "demo-pending", "anonymous")).toEqual([]);
  });
});
