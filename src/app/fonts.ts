import localFont from "next/font/local";
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
 * One variable file covers 200–700. Preloaded with Fraunces (two files max);
 * the size-adjusted Arial fallback keeps the swap from shifting layout.
 */
export const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "200 700",
  display: "swap",
  adjustFontFallback: "Arial",
});
