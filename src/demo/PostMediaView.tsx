import { useEffect, useState } from "react";
import { AppState, Image, StyleSheet, Text, View } from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Pause, Play, Volume2, VolumeX } from "lucide-react-native";
import { PostMedia } from "../domain/media";
import { IconButton } from "./controls";
import { MediaSeek } from "./MediaSeek";

const clock = (time: number) => {
  const seconds = Number.isFinite(time) ? Math.max(0, Math.floor(time)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

function LocalVideo({ media, paused }: { media: PostMedia; paused: boolean }) {
  const player = useVideoPlayer(
    { uri: media.uri, useCaching: false },
    (player) => {
      player.muted = true;
      player.timeUpdateEventInterval = 0.25;
      player.staysActiveInBackground = false;
      player.allowsExternalPlayback = false;
    },
  );
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const { muted } = useEvent(player, "mutedChange", { muted: player.muted });
  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });
  const duration =
    Number.isFinite(player.duration) && player.duration > 0
      ? player.duration
      : 0;
  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  useEffect(() => {
    if (paused) player.pause();
  }, [paused, player]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") player.pause();
    });
    return () => subscription.remove();
  }, [player]);
  if (status === "error")
    return (
      <Text accessibilityRole="alert" style={s.error}>
        This video cannot play on this device. Try another file.
      </Text>
    );
  return (
    <View>
      <VideoView
        player={player}
        style={s.frame}
        contentFit="contain"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
      <View style={s.controls}>
        <IconButton
          icon={isPlaying ? Pause : Play}
          label={isPlaying ? "Pause video" : "Play video"}
          disabled={paused || status !== "readyToPlay"}
          onPress={() => {
            if (isPlaying) player.pause();
            else {
              if (duration && player.currentTime >= duration)
                player.currentTime = 0;
              player.play();
            }
          }}
        />
        <MediaSeek
          duration={duration}
          value={currentTime}
          disabled={status !== "readyToPlay" || !duration}
          onSeek={(value) => {
            player.pause();
            player.currentTime = value;
          }}
        />
        <IconButton
          icon={muted ? VolumeX : Volume2}
          label={muted ? "Unmute video" : "Mute video"}
          onPress={() => {
            player.muted = !player.muted;
          }}
        />
      </View>
      <Text style={s.time}>
        {status === "loading"
          ? "Loading video..."
          : `${clock(currentTime)} / ${duration ? clock(duration) : "--:--"}`}
      </Text>
    </View>
  );
}

export function PostMediaView({
  media,
  paused = false,
}: {
  media: PostMedia;
  paused?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (media.kind === "video")
    return <LocalVideo key={media.uri} media={media} paused={paused} />;
  if (failed)
    return (
      <Text accessibilityRole="alert" style={s.error}>
        This photo could not be displayed. Try another file.
      </Text>
    );
  return (
    <Image
      accessibilityLabel="Post photo"
      source={{ uri: media.uri }}
      resizeMode="contain"
      style={s.frame}
      onError={() => setFailed(true)}
    />
  );
}

const s = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: "#f0f3f0",
    borderRadius: 6,
  },
  controls: { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  time: {
    fontSize: 11,
    color: "#657367",
    textAlign: "center",
    paddingBottom: 4,
  },
  error: { fontSize: 14, color: "#ad3e49", padding: 16 },
});
