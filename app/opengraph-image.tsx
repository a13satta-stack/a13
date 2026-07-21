import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/seo";

// 1200x630 is the size Facebook, WhatsApp, X and Telegram all crop cleanly to.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — Satta King Result & Record Chart`;

/**
 * The card shown when a link to the site is pasted into WhatsApp or X. Drawn
 * here rather than shipped as a PNG so it stays in the site's yellow/black
 * palette without an asset to keep in sync. Next.js emits the matching
 * `og:image` and `twitter:image` tags from this file automatically.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffdd00",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: -2,
            color: "#000",
          }}
        >
          A13 SATTA KING
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            padding: "20px 48px",
            background: "#000",
            color: "#ffdd00",
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          LIVE RESULT &amp; RECORD CHART
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 32,
            color: "#000",
            opacity: 0.75,
          }}
        >
          Sadar Bazar · Shri Ganesh · Delhi Bazar · Gali · Disawar
        </div>
      </div>
    ),
    { ...size },
  );
}
