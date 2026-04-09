"use client";

import { useEffect, useState } from "react";
import CommonModal from "@/components/common/Modal/CommonModal";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import "../securityModals.scss";

interface ChangePasswordModalProps {
  show: boolean;
  handleClose: () => void;
  onSubmit?: (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => void;
}

const EMPTY = { oldPassword: "", newPassword: "", confirmPassword: "" };

function validate(v: typeof EMPTY) {
  const errors: Partial<typeof EMPTY> = {};
  if (!v.oldPassword.trim()) errors.oldPassword = "Old password is required";
  if (!v.newPassword.trim()) {
    errors.newPassword = "New password is required";
  } else if (v.newPassword.trim().length < 8) {
    errors.newPassword = "New password must be at least 8 characters";
  } else if (v.newPassword.trim() === v.oldPassword.trim()) {
    errors.newPassword = "New password must differ from old password";
  }
  if (!v.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (v.newPassword.trim() !== v.confirmPassword.trim()) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

export default function ChangePasswordModal({
  show,
  handleClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof typeof EMPTY, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
    }
  }, [show]);

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  const getError = (field: keyof typeof EMPTY) =>
    (touched[field] || submitted) ? errors[field] : undefined;

  const handleBlur = (field: keyof typeof EMPTY) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    onSubmit?.(values);
  };

  return (
    <CommonModal
      show={show}
      handleClose={handleClose}
      heading="Change Password"
      className="security-modal change-password-modal"
    >
      <div className="change-password-modal__fields">
        <InputField
          label="Old Password"
          name="oldPassword"
          type="password"
          placeholder="Enter Old Password"
          value={values.oldPassword}
          onChange={(e) => setValues((prev) => ({ ...prev, oldPassword: e.target.value }))}
          onBlur={() => handleBlur("oldPassword")}
          error={getError("oldPassword")}
        />
        <InputField
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="Enter New Password"
          value={values.newPassword}
          onChange={(e) => setValues((prev) => ({ ...prev, newPassword: e.target.value }))}
          onBlur={() => handleBlur("newPassword")}
          error={getError("newPassword")}
        />
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Enter Confirm Password"
          value={values.confirmPassword}
          onChange={(e) => setValues((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          onBlur={() => handleBlur("confirmPassword")}
          error={getError("confirmPassword")}
        />
      </div>

      <CommonButton
        title="Change"
        className="w-100 security-modal__action-btn mt-4"
        onClick={handleSubmit}
        disabled={submitted && !isValid}
      />
    </CommonModal>
  );
}
