import localFont from "next/font/local";

/**
 * Self-hosted fonts (see src/fonts/README.md). Each family is split into a
 * latin and a vietnamese face with the same unicode-range values Google Fonts
 * uses, so browsers only download what a page needs. The CSS font stacks in
 * globals.css list both faces; per-character fallback stitches them together.
 * next/font requires literal option values, hence the repeated ranges.
 */

export const bodyLatin = localFont({
  src: [
    { path: "../fonts/be-vietnam-pro-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/be-vietnam-pro-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/be-vietnam-pro-latin-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-body-latin",
  // No generated fallback here: it would catch Vietnamese glyphs before the vi face.
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});

export const bodyVietnamese = localFont({
  src: [
    { path: "../fonts/be-vietnam-pro-vietnamese-400-normal.woff2", weight: "400" },
    { path: "../fonts/be-vietnam-pro-vietnamese-500-normal.woff2", weight: "500" },
    { path: "../fonts/be-vietnam-pro-vietnamese-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-body-vi",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
    },
  ],
});

export const headingLatin = localFont({
  src: "../fonts/lora-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-heading-latin",
  // No generated fallback here: it would catch Vietnamese glyphs before the vi face.
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});

export const headingVietnamese = localFont({
  src: "../fonts/lora-vietnamese-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-heading-vi",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
    },
  ],
});

export const fontVariables = [bodyLatin, bodyVietnamese, headingLatin, headingVietnamese]
  .map((f) => f.variable)
  .join(" ");
