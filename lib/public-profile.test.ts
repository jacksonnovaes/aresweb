import { describe, expect, it } from "vitest";

import { colorWithOpacity, publicMediaUrl, safeProfileColor } from "./public-profile";

describe("public profile helpers", () => {
  it("builds proxy URLs only for stored media paths", () => {
    expect(publicMediaUrl("tenant/logo.webp")).toBe("/api/backend/public/media/tenant/logo.webp");
    expect(publicMediaUrl("https://cdn.example.com/logo.webp")).toBe("https://cdn.example.com/logo.webp");
    expect(publicMediaUrl("/images/logo.webp")).toBe("/images/logo.webp");
    expect(publicMediaUrl(null)).toBe("");
  });

  it("accepts six-digit hexadecimal colors and rejects unsafe values", () => {
    expect(safeProfileColor("#12aBcF", "#000000")).toBe("#12aBcF");
    expect(safeProfileColor("red", "#000000")).toBe("#000000");
    expect(safeProfileColor(undefined, "#FFFFFF")).toBe("#FFFFFF");
  });

  it("converts colors to rgba and clamps opacity", () => {
    expect(colorWithOpacity("#102030", 25)).toBe("rgba(16, 32, 48, 0.25)");
    expect(colorWithOpacity("#102030", 120)).toBe("rgba(16, 32, 48, 0.9)");
    expect(colorWithOpacity("#102030", -10)).toBe("rgba(16, 32, 48, 0)");
  });
});
