import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KleanHQ — The Simplest Field Service Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #5AC8FA 0%, #007AFF 30%, #AF52DE 65%, #FF6B9D 100%)",
          padding: "60px",
        }}
      >
        {/* Glass card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "32px",
            padding: "50px 80px",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            width: "90%",
            height: "80%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: 80,
                lineHeight: 1,
              }}
            >
              💧
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-2px",
              }}
            >
              KleanHQ
            </div>
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            The Simplest Field Service Platform
          </div>

          {/* CTA box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "20px 48px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              Join the Waitlist
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.75)",
            }}
          >
            kleanhq.com — Launching June 2026
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
