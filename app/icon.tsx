import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
// Indigo badge with the site initials, in place of the create-next-app default.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffd800",
          borderRadius: "50%",
          color: "#000",
          fontSize: 30,
          fontWeight: 800,
          // Three glyphs in a 64px square sit tighter than two.
          letterSpacing: -1.5,
        }}
      >
        A13
      </div>
    ),
    { ...size },
  );
}
