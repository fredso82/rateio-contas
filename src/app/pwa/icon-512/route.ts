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
            "radial-gradient(circle at top, rgba(204,122,38,0.4), transparent 30%), linear-gradient(180deg, rgba(28,106,98,1) 0%, rgba(17,75,70,1) 100%)",
          color: "#fff9f1",
          fontFamily: "sans-serif",
        },
      },
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 356,
            height: 356,
            borderRadius: 96,
            background: "rgba(255, 249, 241, 0.16)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.22)",
          },
        },
        createElement(
          "span",
          {
            style: {
              fontSize: 144,
              fontWeight: 800,
              letterSpacing: "-0.1em",
              lineHeight: 1,
            },
          },
          "RC",
        ),
        createElement(
          "span",
          {
            style: {
              marginTop: 12,
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            },
          },
          "Rateio",
        ),
      ),
    ),
    {
      width: 512,
      height: 512,
    },
  );
}
