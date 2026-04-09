import * as Yup from "yup";

/** No angle brackets — blocks basic HTML/script injection in plain text fields */
export const RESTRICT_HTML_TAGS = /^[^<>]*$/;

/** Letters, spaces, apostrophe, hyphen (Unicode letters for i18n names) */
export const NAME_LETTERS_ONLY = /^[\p{L}\s'-]+$/u;

/** Digits with optional leading +; spaces stripped before test in Yup */
export const PHONE_DIGITS_ONLY = /^\+?[0-9]{8,15}$/;

/**
 * Strict email: requires @ with domain, and a recognised TLD (e.g. .com, .in, .org).
 * Blocks bare addresses like user@domain without a proper TLD.
 */
export const EMAIL_STRICT_RE =
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const noHtmlTest = (message = "Angle brackets are not allowed") =>
  Yup.string().matches(RESTRICT_HTML_TAGS, message);

export const nameFieldSchema = (label: string) =>
  noHtmlTest()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .matches(NAME_LETTERS_ONLY, `${label} may only contain letters and spaces`)
    .required(`${label} is required`);

export const emailFieldSchema = () =>
  noHtmlTest()
    .trim()
    .matches(EMAIL_STRICT_RE, "Enter a valid email address (e.g. user@example.com)")
    .required("Email is required");

export const phoneFieldSchema = () =>
  Yup.string()
    .required("Phone Number is required")
    .transform((v) => (typeof v === "string" ? v.replace(/[\s-]/g, "") : v))
    .matches(RESTRICT_HTML_TAGS, "Angle brackets are not allowed")
    .matches(PHONE_DIGITS_ONLY, "Phone must contain only numbers (8–15 digits, optional +)");

export const textFieldSchema = (label: string, required = true) => {
  let s = noHtmlTest().trim();
  if (required) s = s.required(`${label} is required`);
  return s;
};

/** Postal / ZIP-style codes — digits only (3-10 chars) */
export const postalCodeSchema = (label = "Postal Code") =>
  Yup.string()
    .trim()
    .matches(/^[0-9]{3,10}$/, "Postal code must be numbers only (3–10 digits)")
    .required(`${label} is required`);

/** Password: min 8, uppercase, lowercase, digit, special char */
export const passwordSchema = (label = "Password") =>
  Yup.string()
    .trim()
    .min(8, `${label} must be at least 8 characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      `${label} must contain uppercase, lowercase, number and special character`
    )
    .required(`${label} is required`);
