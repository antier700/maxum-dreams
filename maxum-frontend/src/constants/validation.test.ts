import {
  RESTRICT_HTML_TAGS,
  EMAIL_STRICT_RE,
  emailFieldSchema,
  nameFieldSchema,
  phoneFieldSchema,
  postalCodeSchema,
  textFieldSchema,
} from "./validation";

// ─── RESTRICT_HTML_TAGS ────────────────────────────────────────────────────
describe("RESTRICT_HTML_TAGS regex", () => {
  it("blocks strings with angle brackets", () => {
    expect(RESTRICT_HTML_TAGS.test("<script>")).toBe(false);
    expect(RESTRICT_HTML_TAGS.test("hello <b>world</b>")).toBe(false);
    expect(RESTRICT_HTML_TAGS.test("<>")).toBe(false);
  });
  it("allows normal text", () => {
    expect(RESTRICT_HTML_TAGS.test("hello world")).toBe(true);
    expect(RESTRICT_HTML_TAGS.test("")).toBe(true);
    expect(RESTRICT_HTML_TAGS.test("John O'Brien")).toBe(true);
  });
});

// ─── EMAIL_STRICT_RE ──────────────────────────────────────────────────────
describe("EMAIL_STRICT_RE", () => {
  it("accepts valid emails", () => {
    expect(EMAIL_STRICT_RE.test("user@example.com")).toBe(true);
    expect(EMAIL_STRICT_RE.test("a.b+c@domain.co.in")).toBe(true);
    expect(EMAIL_STRICT_RE.test("x@y.org")).toBe(true);
  });
  it("rejects emails without a proper TLD", () => {
    expect(EMAIL_STRICT_RE.test("user@example")).toBe(false);
    expect(EMAIL_STRICT_RE.test("user@")).toBe(false);
    expect(EMAIL_STRICT_RE.test("@example.com")).toBe(false);
    expect(EMAIL_STRICT_RE.test("noatsign.com")).toBe(false);
  });
});

// ─── emailFieldSchema ─────────────────────────────────────────────────────
describe("emailFieldSchema", () => {
  const schema = emailFieldSchema();

  it("passes a valid email", async () => {
    await expect(schema.validate("user@example.com")).resolves.toBe("user@example.com");
  });

  it("trims surrounding whitespace before validating", async () => {
    await expect(schema.validate("  user@example.com  ")).resolves.toBe("user@example.com");
  });

  it("rejects missing @", async () => {
    await expect(schema.validate("notanemail")).rejects.toThrow();
  });

  it("rejects HTML injection", async () => {
    await expect(schema.validate("user@<example>.com")).rejects.toThrow();
  });

  it("rejects empty string", async () => {
    await expect(schema.validate("")).rejects.toThrow();
  });
});

// ─── nameFieldSchema ─────────────────────────────────────────────────────
describe("nameFieldSchema", () => {
  const schema = nameFieldSchema("Full name");

  it("passes a regular name", async () => {
    await expect(schema.validate("John Doe")).resolves.toBeTruthy();
  });

  it("rejects names with HTML tags", async () => {
    await expect(schema.validate("<b>test</b>")).rejects.toThrow();
  });

  it("rejects names shorter than 2 chars", async () => {
    await expect(schema.validate("A")).rejects.toThrow(/at least 2/i);
  });

  it("rejects empty string with a validation error", async () => {
    await expect(schema.validate("")).rejects.toThrow();
  });
});

// ─── phoneFieldSchema ─────────────────────────────────────────────────────
describe("phoneFieldSchema", () => {
  const schema = phoneFieldSchema();

  it("passes a valid phone number", async () => {
    await expect(schema.validate("+919876543210")).resolves.toBeTruthy();
    await expect(schema.validate("9876543210")).resolves.toBeTruthy();
  });

  it("rejects letters in phone number", async () => {
    await expect(schema.validate("abc123")).rejects.toThrow();
  });

  it("rejects empty", async () => {
    await expect(schema.validate("")).rejects.toThrow(/required/i);
  });
});

// ─── postalCodeSchema ─────────────────────────────────────────────────────
describe("postalCodeSchema", () => {
  const schema = postalCodeSchema();

  it("passes valid 6-digit postal code", async () => {
    await expect(schema.validate("110001")).resolves.toBeTruthy();
  });

  it("passes valid 5-digit zip", async () => {
    await expect(schema.validate("90210")).resolves.toBeTruthy();
  });

  it("rejects letters in postal code", async () => {
    await expect(schema.validate("ABC12")).rejects.toThrow();
  });

  it("rejects too short", async () => {
    await expect(schema.validate("12")).rejects.toThrow();
  });

  it("rejects empty", async () => {
    await expect(schema.validate("")).rejects.toThrow();
  });
});

// ─── textFieldSchema ──────────────────────────────────────────────────────
describe("textFieldSchema", () => {
  const schema = textFieldSchema("Subject");

  it("passes plain text", async () => {
    await expect(schema.validate("Hello World")).resolves.toBeTruthy();
  });

  it("rejects HTML injection", async () => {
    await expect(schema.validate("<script>alert(1)</script>")).rejects.toThrow();
  });

  it("rejects empty when required", async () => {
    await expect(schema.validate("")).rejects.toThrow();
  });
});
