import { createElement } from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(28,106,98,1) 0%, rgba(17,75,70,1) 100%)",
          color: "#fff9f1",
          fontFamily: "sans-serif",
        },
      },
      createElement(
        "div",
        {
          style: {
            display: "flex",
            width: 144,
            height: 144,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 249, 241, 0.18)",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)",
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: "-0.08em",
          },
        },
        "RC",
      ),
    ),
    {
      width: 192,
      height: 192,
    },
  );
}
