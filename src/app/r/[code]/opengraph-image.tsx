import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Join KleanHQ Waitlist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  readonly params: Promise<{ code: string }>;
}

export default async function OGImage({ params }: Props) {
  const { code } = await params;

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
              marginBottom: "8px",
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
              fontSize: 32,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "40px",
            }}
          >
            Join the Waitlist
          </div>

          {/* Code box */}
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
                fontSize: 36,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "2px",
              }}
            >
              Use code: {code.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.75)",
            }}
          >
            Skip the line — join kleanhq.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
