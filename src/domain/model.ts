import { PostMedia, validateMedia } from "./media";

export type Privacy = "public" | "private";
export type Audience = "everyone" | "followers" | "mutuals" | "circle";
export type Feed = "community" | "following" | "anonymous";
export type Member = {
  id: string;
  name: string;
  handle: string;
  privacy: Privacy;
  admitted: boolean;
  status: "active" | "pending" | "suspended" | "banned" | "deleting";
  eligible: boolean;
};
export type Post = {
  id: string;
  authorId: string;
  text: string;
  media?: PostMedia;
  anonymous: boolean;
  authorNumber?: number;
  audience: Audience;
  circleId?: string;
  createdAt: string;
};
export type Circle = {
  id: string;
  ownerId: string;
  name: string;
  members: string[];
};
export type World = {
  members: Member[];
  posts: Post[];
  follows: { follower: string; followee: string }[];
  blocks: { blocker: string; blocked: string }[];
  circles: Circle[];
};
export const audienceLabels: Record<Audience, string> = {
  everyone: "Everyone on Eve",
  followers: "Followers",
  mutuals: "Mutuals",
  circle: "Close friends",
};
export const defaultAudience = (privacy: Privacy): Audience =>
  privacy === "private" ? "followers" : "everyone";
export const isActive = (member?: Member) =>
  Boolean(member?.admitted && member.eligible && member.status === "active");
export const follows = (world: World, follower: string, followee: string) =>
  world.follows.some(
    (edge) => edge.follower === follower && edge.followee === followee,
  );

// Preview logic only. Real access must be enforced independently by the database.
export function canRead(world: World, viewerId: string, post: Post): boolean {
  if (
    !isActive(world.members.find((m) => m.id === viewerId)) ||
    !isActive(world.members.find((m) => m.id === post.authorId))
  )
    return false;
  if (
    world.blocks.some(
      (b) =>
        (b.blocker === viewerId && b.blocked === post.authorId) ||
        (b.blocked === viewerId && b.blocker === post.authorId),
    )
  )
    return false;
  if (post.anonymous && (post.audience !== "everyone" || post.circleId))
    return false;
  if (viewerId === post.authorId) return true;
  switch (post.audience) {
    case "everyone":
      return true;
    case "followers":
      return follows(world, viewerId, post.authorId);
    case "mutuals":
      return (
        follows(world, viewerId, post.authorId) &&
        follows(world, post.authorId, viewerId)
      );
    case "circle":
      return world.circles.some(
        (c) =>
          c.id === post.circleId &&
          c.ownerId === post.authorId &&
          c.members.includes(viewerId),
      );
  }
}

export function feedPosts(world: World, viewerId: string, feed: Feed): Post[] {
  return world.posts
    .filter(
      (p) =>
        canRead(world, viewerId, p) &&
        (feed === "anonymous"
          ? p.anonymous
          : !p.anonymous &&
            (feed === "community"
              ? p.audience === "everyone"
              : follows(world, viewerId, p.authorId))),
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    );
}

export function changePrivacy(
  world: World,
  actorId: string,
  privacy: Privacy,
): World {
  if (!isActive(world.members.find((m) => m.id === actorId)))
    throw new Error("An active membership is required.");
  if (world.members.find((m) => m.id === actorId)?.privacy === privacy)
    return world;
  return {
    ...world,
    members: world.members.map((m) =>
      m.id === actorId ? { ...m, privacy } : m,
    ),
    posts: world.posts.map((p) => {
      if (p.authorId !== actorId || p.anonymous || p.audience === "circle")
        return p;
      return {
        ...p,
        audience:
          privacy === "public"
            ? "everyone"
            : p.audience === "everyone"
              ? "followers"
              : p.audience,
      };
    }),
  };
}

export function createPost(
  world: World,
  actorId: string,
  input: Omit<Post, "authorId">,
): World {
  if (!isActive(world.members.find((m) => m.id === actorId)))
    throw new Error("An active membership is required.");
  if ((!input.text.trim() && !input.media) || input.text.trim().length > 2000)
    throw new Error(
      "Add text, a photo or a video. Captions can be up to 2,000 characters.",
    );
  if (input.media) validateMedia(input.media);
  if (world.posts.some((p) => p.id === input.id))
    throw new Error("This post already exists.");
  if (
    input.anonymous &&
    (input.audience !== "everyone" ||
      input.circleId ||
      !Number.isInteger(input.authorNumber) ||
      input.authorNumber! < 1)
  )
    throw new Error("Anonymous posts must be app-wide with an author number.");
  if (
    input.anonymous &&
    world.posts.some(
      (p) => p.anonymous && p.authorNumber === input.authorNumber,
    )
  )
    throw new Error("Author number is already in use.");
  if (input.audience === "circle") {
    if (
      !world.circles.some(
        (c) => c.id === input.circleId && c.ownerId === actorId,
      )
    )
      throw new Error("Choose one of your circles.");
  } else if (input.circleId)
    throw new Error("Only close-friends posts can have a circle.");
  return {
    ...world,
    posts: [
      { ...input, authorId: actorId, text: input.text.trim() },
      ...world.posts,
    ],
  };
}

export function deletePost(
  world: World,
  actorId: string,
  postId: string,
): World {
  if (!isActive(world.members.find((m) => m.id === actorId)))
    throw new Error("An active membership is required.");
  if (!world.posts.some((p) => p.id === postId && p.authorId === actorId))
    throw new Error("Only your own posts can be deleted.");
  return { ...world, posts: world.posts.filter((p) => p.id !== postId) };
}
