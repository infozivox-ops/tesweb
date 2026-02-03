import { describe, expect, it } from "vitest";
import { ibanSchema } from "@/lib/validation";

describe("ibanSchema", () => {
  it("accepts valid TR iban", () => {
    const result = ibanSchema.safeParse("TR120006200000123456789012");
    expect(result.success).toBe(true);
  });

  it("rejects non-TR iban", () => {
    const result = ibanSchema.safeParse("DE120006200000123456789012");
    expect(result.success).toBe(false);
  });

  it("strips spaces", () => {
    const result = ibanSchema.safeParse("TR12 0006 2000 0012 3456 7890 12");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("TR120006200000123456789012");
    }
  });
});
