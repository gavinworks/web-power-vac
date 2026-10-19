import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * Shared renderer for the social share images (opengraph-image.tsx in each
 * route). Each page passes its own annotation and headline, so a shared link
 * shows the page's title next to the Power-Vac badge.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const NAVY = "#071a33";
const NAVY_SOFT = "#12294a";
const SKY = "#1fb0f0";

// Scoped to src/assets/og so only that folder is bundled with the function
const asset = (name: string) =>
  readFile(join(process.cwd(), "src/assets/og", name));

interface OgImageProps {
  /** Small handwritten line above the headline, e.g. "the main event". */
  annotation?: string | null;
  /** CMS headline: new lines break, *words in asterisks* turn sky blue. */
  heading: string;
  /** Line under the headline. Defaults to what the business does and where. */
  strapline?: string;
}

export async function renderOgImage({
  annotation,
  heading,
  strapline = "Gutter cleaning from the ground · Norwich & Norfolk",
}: OgImageProps) {
  const [condensed, regular, hand, logo] = await Promise.all([
    asset("bricolage-800-condensed.ttf"),
    asset("bricolage-600.ttf"),
    asset("caveat-700.ttf"),
    asset("logo.png"),
  ]);

  const lines = heading.split("\n");
  const length = heading.replace(/\*/g, "").length;
  const fontSize = length > 48 ? 70 : length > 30 ? 84 : 104;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: `radial-gradient(circle at 78% 45%, ${NAVY_SOFT} 0%, ${NAVY} 60%)`,
        color: "white",
        fontFamily: "Bricolage",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 760,
          padding: "0 0 0 72px",
        }}
      >
        {annotation && (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 48,
              color: SKY,
              marginBottom: 12,
              transform: "rotate(-2deg)",
            }}
          >
            {annotation}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Bricolage Condensed",
            fontSize,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>
              {line.split(/(\*[^*]+\*)/).map((part, j) =>
                part.startsWith("*") && part.endsWith("*") ? (
                  <span key={j} style={{ color: SKY, whiteSpace: "pre" }}>
                    {part.slice(1, -1)}
                  </span>
                ) : (
                  <span key={j} style={{ whiteSpace: "pre-wrap" }}>
                    {part}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 26,
            color: "#c9e3f2",
          }}
        >
          {strapline}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            borderRadius: 9999,
            boxShadow: `0 0 120px 10px rgba(31, 176, 240, 0.35)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={400}
            height={390}
            alt=""
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 10,
          background: SKY,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 36,
          fontSize: 24,
          color: SKY,
        }}
      >
        {new URL(siteConfig.url).host.replace(/^www\./, "")}
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Bricolage Condensed", data: condensed, weight: 800 },
        { name: "Bricolage", data: regular, weight: 600 },
        { name: "Caveat", data: hand, weight: 700 },
      ],
    }
  );
}
