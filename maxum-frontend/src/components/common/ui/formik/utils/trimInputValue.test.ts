import { shouldTrimInputValue, handleGlobalKeyFilter } from "./trimInputValue";

describe("shouldTrimInputValue", () => {
  it("returns true for text inputs with trimOnBlur enabled", () => {
    expect(shouldTrimInputValue("text", { trimOnBlur: true, disabled: false, readOnly: false })).toBe(true);
    expect(shouldTrimInputValue("email", { trimOnBlur: true, disabled: false, readOnly: false })).toBe(true);
    expect(shouldTrimInputValue(undefined, { trimOnBlur: true, disabled: false, readOnly: false })).toBe(true);
  });

  it("returns false for password type (spaces may be intentional)", () => {
    expect(shouldTrimInputValue("password", { trimOnBlur: true, disabled: false, readOnly: false })).toBe(false);
  });

  it("returns false when trimOnBlur is disabled", () => {
    expect(shouldTrimInputValue("text", { trimOnBlur: false, disabled: false, readOnly: false })).toBe(false);
  });

  it("returns false when input is disabled", () => {
    expect(shouldTrimInputValue("text", { trimOnBlur: true, disabled: true, readOnly: false })).toBe(false);
  });

  it("returns false when input is readOnly", () => {
    expect(shouldTrimInputValue("text", { trimOnBlur: true, disabled: false, readOnly: true })).toBe(false);
  });

  it("returns false for date inputs", () => {
    expect(shouldTrimInputValue("date", { trimOnBlur: true, disabled: false, readOnly: false })).toBe(false);
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal synthetic KeyboardEvent with a mutable currentTarget */
function makeKeyEvent(
  key: string,
  currentTargetOverrides: Partial<HTMLInputElement> = {}
) {
  const el = {
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
    ...currentTargetOverrides,
  } as HTMLInputElement;

  const e = {
    key,
    currentTarget: el,
    preventDefault: jest.fn(),
  } as unknown as React.KeyboardEvent<HTMLInputElement>;

  return e;
}

// ─── handleGlobalKeyFilter ───────────────────────────────────────────────────

describe("handleGlobalKeyFilter – angle brackets", () => {
  it("blocks < character on text inputs", () => {
    const e = makeKeyEvent("<");
    expect(handleGlobalKeyFilter(e, "text")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("blocks > character on email inputs", () => {
    const e = makeKeyEvent(">");
    expect(handleGlobalKeyFilter(e, "email")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("allows < and > on password inputs", () => {
    const e = makeKeyEvent("<");
    expect(handleGlobalKeyFilter(e, "password")).toBe(false);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });
});

describe("handleGlobalKeyFilter – space key on password inputs", () => {
  it("blocks space at the start of an empty password field", () => {
    const e = makeKeyEvent(" ", { value: "", selectionStart: 0, selectionEnd: 0 });
    expect(handleGlobalKeyFilter(e, "password")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("blocks space in the middle of a password field", () => {
    const e = makeKeyEvent(" ", { value: "MyPass", selectionStart: 3, selectionEnd: 3 });
    expect(handleGlobalKeyFilter(e, "password")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("blocks space at the end of a password field", () => {
    const e = makeKeyEvent(" ", { value: "Abc@1234", selectionStart: 8, selectionEnd: 8 });
    expect(handleGlobalKeyFilter(e, "password")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("still allows < and > in password fields (valid special chars)", () => {
    const lt = makeKeyEvent("<");
    expect(handleGlobalKeyFilter(lt, "password")).toBe(false);
    expect(lt.preventDefault).not.toHaveBeenCalled();

    const gt = makeKeyEvent(">");
    expect(handleGlobalKeyFilter(gt, "password")).toBe(false);
    expect(gt.preventDefault).not.toHaveBeenCalled();
  });
});

describe("handleGlobalKeyFilter – space key on email / number / tel", () => {
  it("blocks space in email inputs at any position", () => {
    const e = makeKeyEvent(" ", { value: "hello", selectionStart: 3, selectionEnd: 3 });
    expect(handleGlobalKeyFilter(e, "email")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("blocks space in number inputs", () => {
    const e = makeKeyEvent(" ", { value: "42", selectionStart: 2, selectionEnd: 2 });
    expect(handleGlobalKeyFilter(e, "number")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("blocks space in tel inputs", () => {
    const e = makeKeyEvent(" ", { value: "+91", selectionStart: 3, selectionEnd: 3 });
    expect(handleGlobalKeyFilter(e, "tel")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });
});

describe("handleGlobalKeyFilter – leading-space guard on text inputs", () => {
  it("blocks space when cursor is at position 0 on empty field", () => {
    const e = makeKeyEvent(" ", { value: "", selectionStart: 0, selectionEnd: 0 });
    expect(handleGlobalKeyFilter(e, "text")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("blocks space when value is all-whitespace (user typed spaces only)", () => {
    const e = makeKeyEvent(" ", { value: "   ", selectionStart: 3, selectionEnd: 3 });
    expect(handleGlobalKeyFilter(e, "text")).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("allows internal space after real characters (e.g. first name field)", () => {
    const e = makeKeyEvent(" ", { value: "John", selectionStart: 4, selectionEnd: 4 });
    expect(handleGlobalKeyFilter(e, "text")).toBe(false);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });
});

describe("handleGlobalKeyFilter – normal characters pass through", () => {
  it("allows letter keys on text inputs", () => {
    const e = makeKeyEvent("a");
    expect(handleGlobalKeyFilter(e, "text")).toBe(false);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("allows digit keys on number inputs", () => {
    const e = makeKeyEvent("5");
    expect(handleGlobalKeyFilter(e, "number")).toBe(false);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });
});
