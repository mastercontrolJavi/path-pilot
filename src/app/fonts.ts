import { Fraunces, Fragment_Mono } from "next/font/google";

/** Display — page titles, hero, destination names, big result numbers. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Data — salary figures, match percentages, journey-log dates. Never labels. */
export const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment-mono",
  display: "swap",
  preload: false,
});

/**
 * UI / body — General Sans (Fontshare, ITF Free Font License), self-hosted.
 *
 * The font file is not in the repo yet. Until it is, `--font-general-sans` is
 * unset and `--font-sans` falls back to the system UI stack (see globals.css).
 * When src/app/fonts/GeneralSans-Variable.woff2 exists, replace the export with:
 *
 *   import localFont from "next/font/local";
 *   export const generalSans = localFont({
 *     src: "./fonts/GeneralSans-Variable.woff2",
 *     variable: "--font-general-sans",
 *     weight: "200 700",
 *     display: "swap",
 *     adjustFontFallback: "Arial",
 *   });
 */
export const generalSans = { variable: "" };
