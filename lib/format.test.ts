import { describe, expect, it } from "vitest";

import { formatMoney, initials, maskDocument } from "./format";

describe("format", () => {
  it("formats monetary values in Brazilian reais", () => {
    expect(formatMoney(1234.56)).toMatch(/R\$\s*1\.234,56/);
    expect(formatMoney()).toMatch(/R\$\s*0,00/);
  });

  it("builds initials from at most the first two names", () => {
    expect(initials("  Maria   da Silva ")).toBe("MD");
    expect(initials("Ares")).toBe("A");
    expect(initials("   ")).toBe("");
  });

  it("masks CPF and CNPJ while preserving unknown documents", () => {
    expect(maskDocument("12345678901")).toBe("123.456.789-01");
    expect(maskDocument("12.345.678/0001-90")).toBe("12.345.678/0001-90");
    expect(maskDocument("RG-123")).toBe("RG-123");
    expect(maskDocument()).toBe("—");
  });
});
