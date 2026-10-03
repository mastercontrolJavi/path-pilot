import { Composition, type CalculateMetadataFunction } from "remotion";
import { Film, type FilmProps } from "./films/Film";
import { FILM_S } from "./timing";
import "./fonts";

// Frame rate comes from props, so any composition renders at 60 (master) or 30 (previews, social)
// without changing timing: every scene works in seconds.
const metadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.round(FILM_S * props.fps),
});

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Film16x9"
        component={Film}
        defaultProps={{ layout: "landscape", fps: 60 } satisfies FilmProps}
        calculateMetadata={metadata}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={Math.round(FILM_S * 60)}
      />
      <Composition
        id="Film9x16"
        component={Film}
        defaultProps={{ layout: "portrait", fps: 30 } satisfies FilmProps}
        calculateMetadata={metadata}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={Math.round(FILM_S * 30)}
      />
    </>
  );
}
