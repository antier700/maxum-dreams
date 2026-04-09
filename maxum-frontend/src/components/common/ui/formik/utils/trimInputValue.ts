import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { flushSync } from "react-dom";

/** Input types where leading/trailing spaces are meaningful or trimming is unsafe */
const NO_TRIM_TYPES = new Set([
  "password",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
  "file",
  "range",
  "color",
  "hidden",
]);

/**
 * Character classes that are never allowed in plain text fields.
 * Blocks HTML tags / basic script injection at the keyboard level.
 */
const BLOCKED_CHARS_RE = /[<>]/;

/** Types that must never contain any spaces */
const NO_SPACE_TYPES = new Set(["email", "number", "tel"]);

export function shouldTrimInputValue(
  type: string | undefined,
  options: { trimOnBlur: boolean; disabled: boolean; readOnly: boolean }
): boolean {
  if (!options.trimOnBlur || options.disabled || options.readOnly) return false;
  const t = type || "text";
  return !NO_TRIM_TYPES.has(t);
}

/**
 * Intercept keydown to:
 *  1. Block `<` / `>` on all non-password text inputs (prevents HTML injection).
 *     `<` and `>` are intentionally left available in password fields because they
 *     can appear in strong passwords.
 *  2. Block space entirely in password / email / number / tel inputs.
 *  3. Block a leading space (position 0) in any other text-like input so
 *     fields can never start with whitespace even before blur fires.
 */
export function handleGlobalKeyFilter(
  e: KeyboardEvent<HTMLInputElement>,
  type: string | undefined
): boolean {
  const t = type || "text";

  // Block HTML angle brackets on every type EXCEPT password
  if (t !== "password" && BLOCKED_CHARS_RE.test(e.key)) {
    e.preventDefault();
    return true;
  }

  if (e.key === " ") {
    // password: spaces are never meaningful and cause silent submit failures
    if (t === "password") {
      e.preventDefault();
      return true;
    }

    // email / number / tel: spaces are never valid
    if (NO_SPACE_TYPES.has(t)) {
      e.preventDefault();
      return true;
    }

    // Other text inputs: block a space only when it would be the first character
    // so fields can never start with whitespace (leading-space guard).
    const el = e.currentTarget;
    const selStart = el.selectionStart ?? 0;
    const selEnd = el.selectionEnd ?? 0;
    const val = el.value;

    // Block when cursor is at position 0 with nothing selected
    // OR when the entire current value is whitespace-only (e.g. "   ")
    if (selStart === 0 && selEnd === 0) {
      e.preventDefault();
      return true;
    }
    if (val.trim() === "") {
      e.preventDefault();
      return true;
    }
  }

  return false;
}

/**
 * Form submit often fires on Enter before blur; sync trimmed value into Formik
 * so onSubmit sees trimmed strings even when user never blurred the field.
 */
export function flushTrimOnEnterKey(
  e: KeyboardEvent<HTMLInputElement>,
  type: string | undefined,
  options: { trimOnBlur: boolean; disabled: boolean; readOnly: boolean },
  onChange: ((e: ChangeEvent<HTMLInputElement>) => void) | undefined
): void {
  if (e.key !== "Enter") return;
  if (!shouldTrimInputValue(type, options) || !onChange) return;
  const el = e.currentTarget;
  const raw = el.value;
  const t = raw.trim();
  if (t === raw) return;
  const next = { ...el, value: t } as EventTarget & HTMLInputElement;
  const synthetic = {
    ...e,
    target: next,
    currentTarget: next,
  } as ChangeEvent<HTMLInputElement>;
  flushSync(() => {
    onChange(synthetic);
  });
}

/**
 * Leading/trailing trim on blur for controlled fields (Formik).
 * Calls onChange only when the trimmed value differs so parent state stays in sync before submit.
 */
export function createTrimOnBlurHandler(
  type: string | undefined,
  options: { trimOnBlur: boolean; disabled: boolean; readOnly: boolean },
  onChange: ((e: ChangeEvent<HTMLInputElement>) => void) | undefined,
  onBlur: ((e: FocusEvent<HTMLInputElement>) => void) | undefined
): (e: FocusEvent<HTMLInputElement>) => void {
  const trim = shouldTrimInputValue(type, options);

  return (e: FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const t = trim ? raw.trim() : raw;
    if (trim && onChange && t !== raw) {
      const next = { ...e.target, value: t } as EventTarget & HTMLInputElement;
      onChange({
        ...e,
        target: next,
        currentTarget: next,
      } as ChangeEvent<HTMLInputElement>);
    }
    if (onBlur) {
      const nextTarget = { ...e.target, value: t } as EventTarget & HTMLInputElement;
      onBlur({
        ...e,
        target: nextTarget,
        currentTarget: nextTarget,
      } as FocusEvent<HTMLInputElement>);
    }
  };
}

/** Same handler for `<textarea>` (Form.Control as="textarea"). */
export function createTrimOnTextareaBlurHandler(
  options: { trimOnBlur: boolean; disabled: boolean; readOnly: boolean },
  onChange: ((e: ChangeEvent<HTMLInputElement>) => void) | undefined,
  onBlur: ((e: FocusEvent<HTMLInputElement>) => void) | undefined
): (e: FocusEvent<HTMLTextAreaElement>) => void {
  const trim = options.trimOnBlur && !options.disabled && !options.readOnly;

  return (e: FocusEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const t = trim ? raw.trim() : raw;
    if (trim && onChange && t !== raw) {
      const next = { ...e.target, value: t } as unknown as EventTarget & HTMLInputElement;
      onChange({
        ...e,
        target: next,
        currentTarget: next,
      } as ChangeEvent<HTMLInputElement>);
    }
    if (onBlur) {
      const nextTarget = { ...e.target, value: t } as unknown as EventTarget & HTMLInputElement;
      onBlur({
        ...e,
        target: nextTarget,
        currentTarget: nextTarget,
      } as FocusEvent<HTMLInputElement>);
    }
  };
}
