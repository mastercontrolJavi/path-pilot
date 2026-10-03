import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { AUDIO, FILM_S, MUSIC_FADE_S, SCENES, frames } from "../timing";
import type { Layout } from "../components/Frame";
import { S2Fog } from "../scenes/S2Fog";
import { S3OneRoute } from "../scenes/S3OneRoute";
import { S4Upload } from "../scenes/S4Upload";
import { S7Destination } from "../scenes/S7Destination";
import { S8Logo } from "../scenes/S8Logo";

const SCENE = { S2: S2Fog, S3: S3OneRoute, S4: S4Upload, S7: S7Destination, S8: S8Logo } as const;

export type FilmProps = { layout: Layout; fps: number };

/** The 25-second cut: 2 → 3 → 4 → 7 → 8. Scenes re-stage per layout instead of cropping. */
export function Film({ layout }: FilmProps) {
  const { fps } = useVideoConfig();
  const end = frames(FILM_S, fps);
  return (
    <AbsoluteFill>
      {SCENES.map((s) => {
        const Scene = SCENE[s.id];
        const from = frames(s.start, fps);
        return (
          <Sequence key={s.id} name={`${s.id} ${s.name}`} from={from} durationInFrames={frames(s.end, fps) - from}>
            <Scene layout={layout} />
          </Sequence>
        );
      })}
      {/* Fade out over the last 1.5s (brief §6). */}
      <Audio
        src={staticFile(AUDIO)}
        volume={(f) => interpolate(f, [end - frames(MUSIC_FADE_S, fps), end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
}
