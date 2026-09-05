import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { randomUUID, getRandomBytes } from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import {
  Check,
  ChevronRight,
  CircleUserRound,
  EyeOff,
  Globe2,
  Home,
  ImagePlus,
  LockKeyhole,
  NotebookPen,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
  Video,
  X,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  Audience,
  Feed,
  Post,
  Privacy,
  audienceLabels,
  canRead,
  changePrivacy,
  createPost,
  defaultAudience,
  deletePost,
  feedPosts,
} from "../domain/model";
import { createDemoWorld, demoMemberId } from "./fixtures";
import { PostMedia, validateMedia } from "../domain/media";
import { PostMediaView } from "./PostMediaView";
import { IconButton } from "./controls";

const green = "#17634b";
const ink = "#242a27";
const audienceIcons: Record<Audience, LucideIcon> = {
  everyone: Globe2,
  followers: UsersRound,
  mutuals: UsersRound,
  circle: LockKeyhole,
};
type Page = "home" | "posts" | "account";

function releaseMedia(uri: string) {
  if (Platform.OS === "web" && uri.startsWith("blob:"))
    URL.revokeObjectURL(uri);
}

function Action({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.action,
        secondary && s.secondary,
        disabled && s.disabled,
        pressed && s.pressed,
      ]}
    >
      <Text style={[s.actionText, secondary && s.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

function Sheet({
  title,
  onClose,
  children,
  dismissible = true,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.overlay}
      >
        <SafeAreaView style={s.sheet} accessibilityViewIsModal aria-modal>
          <View style={s.sheetHeader}>
            <Text accessibilityRole="header" style={s.sectionTitle}>
              {title}
            </Text>
            {dismissible && (
              <IconButton icon={X} label="Close" onPress={onClose} />
            )}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.sheetBody}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Preview() {
  const [world, setWorld] = useState(createDemoWorld);
  const [page, setPage] = useState<Page>("home");
  const [feed, setFeed] = useState<Feed>("community");
  const [ownAnonymous, setOwnAnonymous] = useState(false);
  const [initialPrivacy, setInitialPrivacy] = useState<Privacy | null>(null);
  const [started, setStarted] = useState(false);
  const [composer, setComposer] = useState(false);
  const [draft, setDraft] = useState("");
  const [media, setMedia] = useState<PostMedia>();
  const [picking, setPicking] = useState(false);
  const pickerEpoch = useRef(0);
  const localMediaUris = useRef(new Set<string>());
  const [anonymous, setAnonymous] = useState(false);
  const [audience, setAudience] = useState<Audience>("followers");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [privacyConfirmation, setPrivacyConfirmation] =
    useState<Privacy | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [discarding, setDiscarding] = useState(false);
  // Keep object URLs alive while referenced by a draft or post, then release them.
  useEffect(() => {
    const used = new Set(
      world.posts.flatMap((post) => (post.media ? [post.media.uri] : [])),
    );
    if (media) used.add(media.uri);
    for (const uri of localMediaUris.current) {
      if (!used.has(uri)) {
        releaseMedia(uri);
        localMediaUris.current.delete(uri);
      }
    }
  }, [world.posts, media]);
  useEffect(
    () => () => {
      pickerEpoch.current++;
      for (const uri of localMediaUris.current) releaseMedia(uri);
      localMediaUris.current.clear();
    },
    [],
  );
  const me = world.members.find((m) => m.id === demoMemberId)!;
  const visiblePosts =
    page === "posts"
      ? world.posts
          .filter(
            (p) =>
              p.authorId === me.id &&
              p.anonymous === ownAnonymous &&
              canRead(world, me.id, p),
          )
          .sort(
            (a, b) =>
              b.createdAt.localeCompare(a.createdAt) ||
              b.id.localeCompare(a.id),
          )
      : feedPosts(world, me.id, feed);

  function openComposer() {
    pickerEpoch.current++;
    setPicking(false);
    setMedia(undefined);
    setDraft("");
    setAnonymous(false);
    setAudience(defaultAudience(me.privacy));
    setError("");
    setComposer(true);
    setNotice("");
  }
  function closeComposer() {
    pickerEpoch.current++;
    setPicking(false);
    if (draft.trim() || media) setDiscarding(true);
    else setComposer(false);
  }
  async function pickMedia(kind: PostMedia["kind"]) {
    const epoch = ++pickerEpoch.current;
    setPicking(true);
    setError("");
    let candidateUri: string | undefined;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [kind === "image" ? "images" : "videos"],
        allowsEditing: false,
        allowsMultipleSelection: false,
        exif: false,
        base64: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      candidateUri = asset.uri;
      if (epoch !== pickerEpoch.current) {
        releaseMedia(candidateUri);
        return;
      }
      if (asset.type !== kind)
        throw new Error("Choose the matching photo or video type.");
      const selected: PostMedia = {
        kind,
        uri: asset.uri,
        mimeType: asset.mimeType ?? "",
        width: asset.width,
        height: asset.height,
        bytes: asset.fileSize ?? 0,
      };
      validateMedia(selected);
      localMediaUris.current.add(selected.uri);
      setMedia(selected);
    } catch (e) {
      if (candidateUri) releaseMedia(candidateUri);
      if (epoch === pickerEpoch.current)
        setError(
          e instanceof Error ? e.message : "Could not open your media library.",
        );
    } finally {
      if (epoch === pickerEpoch.current) setPicking(false);
    }
  }
  function publish() {
    try {
      let authorNumber: number | undefined;
      if (anonymous) {
        do {
          const bytes = getRandomBytes(4);
          authorNumber =
            1000 +
            (new DataView(
              bytes.buffer,
              bytes.byteOffset,
              bytes.byteLength,
            ).getUint32(0) %
              999000);
        } while (world.posts.some((p) => p.authorNumber === authorNumber));
      }
      setWorld(
        createPost(world, me.id, {
          id: randomUUID(),
          text: draft,
          media,
          anonymous,
          authorNumber,
          audience: anonymous ? "everyone" : audience,
          circleId:
            !anonymous && audience === "circle"
              ? "your-close-friends"
              : undefined,
          createdAt: new Date().toISOString(),
        }),
      );
      setComposer(false);
      pickerEpoch.current++;
      setMedia(undefined);
      setDraft("");
      setPage("posts");
      setOwnAnonymous(anonymous);
      setNotice("Posted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish.");
    }
  }

  function renderPost(post: Post) {
    const author = world.members.find((m) => m.id === post.authorId)!;
    const label = post.anonymous ? `Author ${post.authorNumber}` : author.name;
    const AudienceIcon = audienceIcons[post.audience];
    return (
      <View key={post.id} style={s.post} testID="post">
        <View style={s.postHeader}>
          <View
            accessibilityElementsHidden
            style={[
              s.avatar,
              post.anonymous
                ? s.anonymousAvatar
                : author.id === "demo-sana"
                  ? s.roseAvatar
                  : s.namedAvatar,
            ]}
          >
            {post.anonymous ? (
              <EyeOff size={20} color="#5b626c" />
            ) : (
              <Text style={s.initial}>{author.name.charAt(0)}</Text>
            )}
          </View>
          <View style={s.postAuthor}>
            <Text style={s.author}>{label}</Text>
            <View style={s.metaRow}>
              <AudienceIcon size={12} color="#6c746f" />
              <Text style={s.meta}>{audienceLabels[post.audience]}</Text>
              <Text style={s.meta}>
                {post.id.startsWith("seed-") ? "Sample" : "Just now"}
              </Text>
            </View>
          </View>
          {post.authorId === me.id && (
            <IconButton
              icon={Trash2}
              label="Delete post"
              danger
              onPress={() => setDeleting(post)}
            />
          )}
        </View>
        {!!post.text && <Text style={s.postText}>{post.text}</Text>}
        {post.media && (
          <View style={s.postMedia}>
            <PostMediaView
              key={post.media.uri}
              media={post.media}
              paused={composer || !!deleting || !!privacyConfirmation}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        <View style={s.previewBar}>
          <View style={s.previewDot} />
          <Text style={s.previewText}>LOCAL PREVIEW · SAMPLE ACCOUNTS</Text>
        </View>
        <View style={s.header}>
          <Text style={s.brand}>eve</Text>
          <View style={s.headerRight}>
            <Text style={s.accountLabel}>
              {me.privacy === "private" ? "Private account" : "Public account"}
            </Text>
            <IconButton
              icon={Plus}
              label="Create post"
              onPress={openComposer}
            />
          </View>
        </View>
        <ScrollView
          key={`${page}-${feed}-${ownAnonymous}`}
          contentContainerStyle={s.scrollBody}
          keyboardShouldPersistTaps="handled"
        >
          {notice !== "" && (
            <View style={s.notice} accessibilityLiveRegion="polite">
              <Check size={16} color={green} />
              <Text style={s.noticeText}>{notice}</Text>
            </View>
          )}
          {page === "account" ? (
            <View style={s.accountPage}>
              <View style={s.profileHead}>
                <View style={[s.avatar, s.profileAvatar, s.namedAvatar]}>
                  <CircleUserRound size={30} color={green} />
                </View>
                <Text style={s.pageTitle}>Your account</Text>
                <Text style={s.subtle}>@{me.handle}</Text>
              </View>
              <View style={s.settingRow}>
                <View style={s.settingLabel}>
                  <ShieldCheck size={20} color={green} />
                  <Text style={s.settingTitle}>Membership</Text>
                </View>
                <Text style={s.subtle}>Sample member</Text>
              </View>
              <View style={s.settingSection}>
                <Text style={s.sectionTitle}>Account privacy</Text>
                <View style={s.privacyChoices}>
                  {(["private", "public"] as Privacy[]).map((p) => (
                    <Pressable
                      key={p}
                      accessibilityRole="radio"
                      aria-checked={me.privacy === p}
                      onPress={() =>
                        me.privacy !== p && setPrivacyConfirmation(p)
                      }
                      style={[
                        s.privacyChoice,
                        me.privacy === p && s.privacySelected,
                      ]}
                    >
                      {p === "private" ? (
                        <LockKeyhole size={20} color={green} />
                      ) : (
                        <Globe2 size={20} color={green} />
                      )}
                      <Text style={s.settingTitle}>
                        {p === "private" ? "Private" : "Public"}
                      </Text>
                      {me.privacy === p && <Check size={18} color={green} />}
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={s.settingRow}>
                <View style={s.settingLabel}>
                  <UsersRound size={20} color={green} />
                  <Text style={s.settingTitle}>Close friends</Text>
                </View>
                <Text style={s.subtle}>Noor</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={s.titleRow}>
                <View>
                  <Text style={s.eyebrow}>
                    {page === "home" ? "A LITTLE SPACE FOR YOU" : "YOUR SPACE"}
                  </Text>
                  <Text accessibilityRole="header" style={s.pageTitle}>
                    {page === "home" ? "The conversation" : "Your posts"}
                  </Text>
                </View>
                <NotebookPen size={25} color="#b85766" />
              </View>
              <View style={s.tabs} accessibilityRole="tablist">
                {page === "home"
                  ? (["community", "following", "anonymous"] as Feed[]).map(
                      (tab) => (
                        <Pressable
                          key={tab}
                          accessibilityRole="tab"
                          aria-selected={feed === tab}
                          onPress={() => {
                            setFeed(tab);
                            setNotice("");
                          }}
                          style={[s.tab, feed === tab && s.tabActive]}
                        >
                          <Text
                            style={[s.tabText, feed === tab && s.tabTextActive]}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </Text>
                        </Pressable>
                      ),
                    )
                  : [false, true].map((value) => (
                      <Pressable
                        key={String(value)}
                        accessibilityRole="tab"
                        aria-selected={ownAnonymous === value}
                        onPress={() => {
                          setOwnAnonymous(value);
                          setNotice("");
                        }}
                        style={[s.tab, ownAnonymous === value && s.tabActive]}
                      >
                        <Text
                          style={[
                            s.tabText,
                            ownAnonymous === value && s.tabTextActive,
                          ]}
                        >
                          {value ? "My anonymous posts" : "Named posts"}
                        </Text>
                      </Pressable>
                    ))}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Write a post"
                onPress={openComposer}
                style={s.composerPrompt}
              >
                <View style={[s.avatar, s.smallAvatar, s.namedAvatar]}>
                  <Plus size={19} color={green} />
                </View>
                <Text style={s.promptText}>What is on your mind?</Text>
                <ChevronRight size={18} color="#707a73" />
              </Pressable>
              {visiblePosts.length ? (
                visiblePosts.map(renderPost)
              ) : (
                <View style={s.empty}>
                  <NotebookPen size={30} color="#b85766" />
                  <Text style={s.emptyTitle}>A fresh page.</Text>
                  <Text style={s.subtle}>
                    {page === "posts"
                      ? "Your posts will appear here."
                      : "No posts here yet."}
                  </Text>
                  <Action title="Write a post" onPress={openComposer} />
                </View>
              )}
              {visiblePosts.length > 0 && (
                <Text style={s.endNote}>You are all caught up.</Text>
              )}
            </>
          )}
        </ScrollView>
        <View style={s.bottomNav}>
          {(
            [
              { id: "home", title: "Home", icon: Home },
              { id: "posts", title: "Your posts", icon: NotebookPen },
              { id: "account", title: "Account", icon: CircleUserRound },
            ] as const
          ).map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              aria-selected={page === item.id}
              onPress={() => {
                setPage(item.id);
                setNotice("");
              }}
              style={({ pressed }) => [s.navItem, pressed && s.pressed]}
            >
              <item.icon
                size={22}
                color={page === item.id ? green : "#7b827d"}
                strokeWidth={page === item.id ? 2.4 : 1.7}
              />
              <Text style={[s.navText, page === item.id && s.navSelected]}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
        {!started && (
          <Sheet
            title="Your Eve account"
            dismissible={false}
            onClose={() => {}}
          >
            <Text style={s.copy}>Choose your account privacy.</Text>
            <View style={s.privacyChoices}>
              {(["private", "public"] as Privacy[]).map((p) => (
                <Pressable
                  key={p}
                  accessibilityRole="radio"
                  accessibilityLabel={`${p === "private" ? "Private" : "Public"} account`}
                  aria-checked={initialPrivacy === p}
                  onPress={() => setInitialPrivacy(p)}
                  style={[
                    s.privacyChoice,
                    initialPrivacy === p && s.privacySelected,
                  ]}
                >
                  {p === "private" ? (
                    <LockKeyhole size={20} color={green} />
                  ) : (
                    <Globe2 size={20} color={green} />
                  )}
                  <Text style={s.settingTitle}>
                    {p === "private" ? "Private" : "Public"}
                  </Text>
                  {initialPrivacy === p && <Check size={18} color={green} />}
                </Pressable>
              ))}
            </View>
            <Text style={s.subtle}>
              Local preview. Fictional members. Changes reset on reload.
            </Text>
            <Action
              title="Enter preview"
              disabled={!initialPrivacy}
              onPress={() => {
                if (initialPrivacy) {
                  setWorld(changePrivacy(world, me.id, initialPrivacy));
                  setStarted(true);
                }
              }}
            />
          </Sheet>
        )}
        {composer && (
          <Sheet title="New post" onClose={closeComposer}>
            {discarding ? (
              <>
                <Text style={s.copy}>Discard this draft?</Text>
                <Action
                  title="Keep writing"
                  onPress={() => setDiscarding(false)}
                />
                <Action
                  title="Discard draft"
                  secondary
                  onPress={() => {
                    setDiscarding(false);
                    setComposer(false);
                    setDraft("");
                    setMedia(undefined);
                  }}
                />
              </>
            ) : (
              <>
                <View style={s.switchRow}>
                  <View style={s.settingLabel}>
                    <EyeOff size={21} color={green} />
                    <Text style={s.settingTitle}>Post anonymously</Text>
                  </View>
                  <Switch
                    accessibilityLabel="Post anonymously"
                    value={anonymous}
                    onValueChange={setAnonymous}
                    trackColor={{ false: "#cdd3cf", true: green }}
                  />
                </View>
                <TextInput
                  accessibilityLabel="Post text"
                  placeholder="What is on your mind?"
                  placeholderTextColor="#909891"
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                  maxLength={2000}
                  style={s.textInput}
                  textAlignVertical="top"
                  autoFocus
                />
                <Text style={s.counter}>{draft.length} / 2,000</Text>
                <View style={s.mediaToolbar}>
                  <View style={s.settingLabel}>
                    <IconButton
                      icon={ImagePlus}
                      label={media ? "Replace with photo" : "Add photo"}
                      disabled={picking}
                      onPress={() => {
                        void pickMedia("image");
                      }}
                    />
                    <IconButton
                      icon={Video}
                      label={media ? "Replace with video" : "Add video"}
                      disabled={picking}
                      onPress={() => {
                        void pickMedia("video");
                      }}
                    />
                  </View>
                  {picking ? (
                    <Text accessibilityLiveRegion="polite" style={s.subtle}>
                      Opening library...
                    </Text>
                  ) : (
                    media && (
                      <IconButton
                        icon={X}
                        label="Remove attachment"
                        onPress={() => setMedia(undefined)}
                      />
                    )
                  )}
                </View>
                {media && <PostMediaView key={media.uri} media={media} />}
                <Text style={s.fieldLabel}>AUDIENCE</Text>
                {anonymous ? (
                  <View style={s.fixedAudience}>
                    <Globe2 size={18} color={green} />
                    <Text style={s.settingTitle}>Everyone on Eve</Text>
                  </View>
                ) : (
                  <View>
                    {(Object.keys(audienceLabels) as Audience[]).map(
                      (value) => {
                        const Icon = audienceIcons[value];
                        return (
                          <Pressable
                            key={value}
                            accessibilityRole="radio"
                            accessibilityLabel={audienceLabels[value]}
                            aria-checked={audience === value}
                            onPress={() => setAudience(value)}
                            style={s.audienceOption}
                          >
                            <Icon
                              size={18}
                              color={audience === value ? green : "#727b75"}
                            />
                            <Text style={s.audienceText}>
                              {audienceLabels[value]}
                            </Text>
                            <View
                              style={[
                                s.radio,
                                audience === value && s.radioSelected,
                              ]}
                            >
                              {audience === value && (
                                <View style={s.radioDot} />
                              )}
                            </View>
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                )}
                {!!error && (
                  <Text accessibilityRole="alert" style={s.error}>
                    {error}
                  </Text>
                )}
                <Action
                  title="Post"
                  disabled={picking || (!draft.trim() && !media)}
                  onPress={publish}
                />
              </>
            )}
          </Sheet>
        )}
        {privacyConfirmation && (
          <Sheet
            title={`Make account ${privacyConfirmation}?`}
            onClose={() => setPrivacyConfirmation(null)}
          >
            <Text style={s.copy}>
              {privacyConfirmation === "public"
                ? "All your named posts except close-friends posts will become visible to everyone on Eve. Eligible pending follow requests will be accepted."
                : "Your app-wide named posts will become followers-only. Narrower audiences and existing followers stay unchanged."}
            </Text>
            <Text style={s.copy}>
              Anonymous posts stay app-wide. Close-friends posts stay
              restricted.
            </Text>
            <Action
              title={`Make ${privacyConfirmation}`}
              onPress={() => {
                setWorld(changePrivacy(world, me.id, privacyConfirmation));
                setPrivacyConfirmation(null);
                setNotice("Account privacy updated.");
              }}
            />
            <Action
              title="Cancel"
              secondary
              onPress={() => setPrivacyConfirmation(null)}
            />
          </Sheet>
        )}
        {deleting && (
          <Sheet title="Delete this post?" onClose={() => setDeleting(null)}>
            <Text style={s.copy}>
              This permanently deletes the post. It cannot be undone.
            </Text>
            <Action
              title="Delete permanently"
              onPress={() => {
                setWorld(deletePost(world, me.id, deleting.id));
                setDeleting(null);
                setNotice("Post deleted.");
              }}
            />
            <Action
              title="Keep post"
              secondary
              onPress={() => setDeleting(null)}
            />
          </Sheet>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  mediaToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  postMedia: { marginTop: 16 },
  safe: { flex: 1, backgroundColor: "#f2f5f2" },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e4e9e5",
  },
  previewBar: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf3ee",
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  previewDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: green },
  previewText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5d7164",
    letterSpacing: 0,
  },
  header: {
    paddingHorizontal: 24,
    height: 76,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e9ede9",
  },
  brand: { fontSize: 40, fontWeight: "700", color: green, letterSpacing: 0 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  accountLabel: { fontSize: 12, color: "#6a756c" },
  scrollBody: { flexGrow: 1, paddingBottom: 24 },
  titleRow: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    color: "#778079",
    marginBottom: 8,
    letterSpacing: 0,
  },
  pageTitle: { fontSize: 25, fontWeight: "600", color: ink, letterSpacing: 0 },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e4e9e5",
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    minHeight: 49,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: { borderColor: green },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#707a73",
    textAlign: "center",
  },
  tabTextActive: { color: green, fontWeight: "700" },
  composerPrompt: {
    padding: 20,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 6,
    borderColor: "#f3f5f3",
  },
  promptText: { flex: 1, fontSize: 15, color: "#848c86" },
  post: { padding: 24, borderBottomWidth: 1, borderColor: "#e8ece9" },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  smallAvatar: { width: 34, height: 34 },
  namedAvatar: { backgroundColor: "#e4eee7" },
  roseAvatar: { backgroundColor: "#f7e9ec" },
  anonymousAvatar: { backgroundColor: "#e9edf1" },
  initial: { fontSize: 17, fontWeight: "600", color: "#435b4b" },
  postAuthor: { flex: 1, gap: 4 },
  author: { color: ink, fontWeight: "600", fontSize: 15 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  meta: { color: "#778078", fontSize: 11 },
  postText: { color: "#354039", fontSize: 16, lineHeight: 25, marginTop: 16 },
  endNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#929a94",
    marginTop: 28,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#e4e9e5",
    backgroundColor: "#fff",
    paddingVertical: 9,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 52,
  },
  navText: { fontSize: 11, color: "#7b827d" },
  navSelected: { color: green, fontWeight: "600" },
  pressed: { opacity: 0.65 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20,35,25,0.38)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "95%",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingLeft: 24,
    paddingRight: 12,
    minHeight: 68,
    borderBottomWidth: 1,
    borderColor: "#e4e9e5",
  },
  sheetBody: { padding: 24, gap: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: ink, flexShrink: 1 },
  copy: { color: "#56625a", fontSize: 15, lineHeight: 23 },
  action: {
    minHeight: 48,
    backgroundColor: green,
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
  secondary: { backgroundColor: "#f0f4f1" },
  secondaryText: { color: green },
  disabled: { opacity: 0.4 },
  privacyChoices: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  privacyChoice: {
    flexDirection: "row",
    flexGrow: 1,
    flexBasis: 130,
    alignItems: "center",
    minHeight: 64,
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dce3dd",
    borderRadius: 6,
  },
  privacySelected: { backgroundColor: "#edf5ee", borderColor: green },
  settingTitle: { fontSize: 15, fontWeight: "500", color: ink, flexShrink: 1 },
  subtle: { fontSize: 13, color: "#7a847d", lineHeight: 20 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  textInput: {
    minHeight: 150,
    fontSize: 17,
    lineHeight: 26,
    color: ink,
    paddingVertical: 12,
  },
  counter: {
    fontSize: 11,
    color: "#848d86",
    textAlign: "right",
    marginTop: -12,
  },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: "#778079" },
  fixedAudience: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
  },
  audienceOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 47,
  },
  audienceText: { fontSize: 14, color: ink, flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bdc8bf",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: green },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: green },
  error: { color: "#ad3e49", fontSize: 14 },
  accountPage: { padding: 24 },
  profileHead: { alignItems: "center", gap: 10, paddingVertical: 24 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32 },
  settingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: "#e4e9e5",
  },
  settingSection: {
    paddingVertical: 24,
    gap: 20,
    borderBottomWidth: 1,
    borderColor: "#e4e9e5",
  },
  empty: { alignItems: "center", padding: 40, gap: 16 },
  emptyTitle: { fontSize: 21, fontWeight: "600", color: ink },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#edf5ee",
  },
  noticeText: { color: green, fontSize: 13 },
});
