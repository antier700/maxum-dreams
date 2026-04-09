"use client";

import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import SelectField from "@/components/common/ui/formik/selectField/SelectField";
import PhoneInputField from "@/components/common/ui/formik/phone/PhoneInputField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import { PictureIcon } from "@/assets/icons/svgIcon";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

type Props = {
  isLoadingProfile: boolean;
  formik: any;
};

export default function ProfileTab({ isLoadingProfile, formik }: Props) {
  const [fileInputKey, setFileInputKey] = useState(0);
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);

  const pic = formik.values.profilePicture;

  useEffect(() => {
    if (pic instanceof File) {
      const url = URL.createObjectURL(pic);
      setObjectPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectPreviewUrl(null);
      };
    }
    setObjectPreviewUrl(null);
    return undefined;
  }, [pic]);

  const previewSrc =
    objectPreviewUrl ?? (typeof pic === "string" && pic.length > 0 ? pic : "");

  const clearProfileImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void formik.setFieldValue("profilePicture", "");
    void formik.setFieldTouched("profilePicture", true);
    setFileInputKey((k) => k + 1);
  };

  // Show profile picture errors only if user explicitly touched it
  const showPicError = formik.touched.profilePicture && formik.errors.profilePicture;

  return (
    <div className="investor-settings__content">
      <h2 className="investor-settings__heading">Upload File</h2>
      <div className="investor-settings__upload">
        <div className="position-relative">
          <div className="investor-settings__dropzone">
            <input
              key={fileInputKey}
              className="file_upload"
              style={{ zIndex: 10 }}
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) {
                  formik.setFieldValue("profilePicture", f);
                  void formik.setFieldTouched("profilePicture", true);
                }
              }}
            />
            {previewSrc ? (
              <>
                <img
                  src={previewSrc}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
              </>
            ) : (
              <div className="investor-settings__dropzone-content" style={{ zIndex: 1 }}>
                <div className="investor-settings__dropzone-icon">
                  <PictureIcon />
                </div>
                <p className="investor-settings__dropzone-text mt-2">
                  Drag and Drop File or browse media on your device
                </p>
              </div>
            )}
          </div>
          {previewSrc && (
            <button
              type="button"
              className="investor-settings__dropzone-remove"
              aria-label="Remove profile image"
              onClick={clearProfileImage}
            >
              ×
            </button>
          )}
        </div>
        <p className="investor-settings__hint">JPG, PNG, GIF, SVG, WEBM, MP3, MP4. Max 3mb.</p>
        {showPicError && (
          <div className="text-danger mt-1 fs-12">{formik.errors.profilePicture as string}</div>
        )}
      </div>

      <h2 className="investor-settings__heading">Personal Information</h2>
      {!isLoadingProfile && (
        <form onSubmit={formik.handleSubmit} noValidate>
          <Row className="g-3">
            <Col md={4}>
              <InputField
                label="First Name"
                name="firstName"
                placeholder="Enter First Name"
                value={formik.values.firstName}
                onChange={(e) => formik.setFieldValue("firstName", e.target.value)}
                error={(formik.touched.firstName || formik.submitCount > 0) && (formik.errors.firstName as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Last Name"
                name="lastName"
                placeholder="Enter Last Name"
                value={formik.values.lastName}
                onChange={(e) => formik.setFieldValue("lastName", e.target.value)}
                error={(formik.touched.lastName || formik.submitCount > 0) && (formik.errors.lastName as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter Email"
                value={formik.values.email}
                onChange={(e) => formik.setFieldValue("email", e.target.value)}
                error={(formik.touched.email || formik.submitCount > 0) && (formik.errors.email as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
            <Col md={4}>
              <InputField
                type="date"
                label="Date of Birth"
                name="dob"
                placeholder="DD/MM/YY"
                value={formik.values.dob}
                onChange={(e) => formik.setFieldValue("dob", e.target.value)}
                error={(formik.touched.dob || formik.submitCount > 0) && (formik.errors.dob as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
            <Col md={4}>
              <PhoneInputField
                label="Phone Number"
                name="phone"
                value={formik.values.phone}
                onChange={(v) => formik.setFieldValue("phone", v)}
                onBlur={() => formik.setFieldTouched("phone", true)}
                placeholder="Enter number"
                country="in"
              />
              {(formik.touched.phone || formik.submitCount > 0) && formik.errors.phone && (
                <div className="text-danger mt-1 fs-12">{formik.errors.phone as string}</div>
              )}
            </Col>
            <Col md={4}>
              <SelectField
                label="Gender"
                name="gender"
                options={GENDER_OPTIONS}
                placeholder="Select Gender"
                value={formik.values.gender}
                onChange={(o) => formik.setFieldValue("gender", o?.value ?? "")}
                onBlur={() => formik.setFieldTouched("gender", true)}
              />
              {(formik.touched.gender || formik.submitCount > 0) && formik.errors.gender && (
                <div className="text-danger mt-1 fs-12">{formik.errors.gender as string}</div>
              )}
            </Col>
          </Row>

          <h2 className="investor-settings__heading mt-4">Address</h2>
          <Row className="g-3">
            <Col md={4}>
              <InputField
                label="Street Address"
                name="street"
                placeholder="Enter Address"
                value={formik.values.street}
                onChange={(e) => formik.setFieldValue("street", e.target.value)}
                error={(formik.touched.street || formik.submitCount > 0) && (formik.errors.street as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Postal Code"
                name="postalCode"
                type="text"
                placeholder="Enter Postal Code"
                value={formik.values.postalCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  formik.setFieldValue("postalCode", val);
                }}
                error={(formik.touched.postalCode || formik.submitCount > 0) && (formik.errors.postalCode as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
                maxLength={10}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="City"
                name="city"
                placeholder="Enter City"
                value={formik.values.city}
                onChange={(e) => formik.setFieldValue("city", e.target.value)}
                error={(formik.touched.city || formik.submitCount > 0) && (formik.errors.city as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="State"
                name="state"
                placeholder="Enter State"
                value={formik.values.state}
                onChange={(e) => formik.setFieldValue("state", e.target.value)}
                error={(formik.touched.state || formik.submitCount > 0) && (formik.errors.state as string)}
                onBlur={formik.handleBlur}
                onInput={formik.handleBlur}
              />
            </Col>
          </Row>
          <CommonButton
            type="submit"
            title="Submit"
            className="mt-4"
            isLoading={formik.isSubmitting}
            disabled={formik.isSubmitting || !formik.isValid}
          />
        </form>
      )}
    </div>
  );
}
