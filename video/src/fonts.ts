import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { loadVariableFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadFragmentMono } from "@remotion/google-fonts/FragmentMono";

const fraunces = loadFraunces("normal", { subsets: ["latin"] });
const mono = loadFragmentMono("normal", { weights: ["400"], subsets: ["latin"] });

export const font = {
  display: `${fraunces.fontFamily}, Georgia, serif`,
  sans: `"General Sans", system-ui, sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
};

// Block rendering until every face is ready (brief §3).
const handle = delayRender("Loading fonts");
Promise.all([
  loadFont({ family: "General Sans", url: staticFile("fonts/GeneralSans-Variable.woff2"), weight: "200 700" }),
  fraunces.waitUntilDone(),
  mono.waitUntilDone(),
])
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });

/** Fraunces display settings: optical size matched to rendered size, a little softness. */
export const displayStyle = (sizePx: number, weight = 400): React.CSSProperties => ({
  fontFamily: font.display,
  fontSize: sizePx,
  fontWeight: weight,
  fontVariationSettings: `"opsz" ${Math.min(144, Math.max(9, Math.round(sizePx * 0.75)))}, "SOFT" 50`,
  letterSpacing: sizePx >= 80 ? "-0.02em" : "-0.01em",
  lineHeight: 1.04,
});
