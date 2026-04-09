"use client";

import { Container, Row, Col } from "react-bootstrap";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import TextareaField from "@/components/common/ui/formik/textareaField/TextareaField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import toast from "react-hot-toast";
import getImg from "../../../../public/images/get_art_img.png";
import { contactService } from "@/services/contact.service";
import { emailFieldSchema, nameFieldSchema, textFieldSchema } from "@/constants/validation";
import "./contact-us.scss";

const contactSchema = Yup.object({
  name: nameFieldSchema("Name"),
  email: emailFieldSchema(),
  subject: textFieldSchema("Subject"),
  message: textFieldSchema("Message"),
});

export default function ContactUsPage() {
  return (
    <Container className="investor-contact">
      <Row className="investor-contact__row align-items-center">
        <Col lg={7}>
          <div className="investor-contact__left">
            <div className="investor-contact__illus mb-4" aria-hidden>
              <Image src={getImg} alt="Illustration" />
            </div>
            <h2 className="investor-contact__heading">Get in Touch</h2>
            <p className="investor-contact__text mb-4 mt-2">
              Thinking of selling, or you know someone whom we should meet?
            </p>
            <div className="investor-contact__newsletter">
              <h3 className="investor-contact__newsletter-title">Stay always updated</h3>
              <p className="investor-contact__newsletter-desc">Sign up for monthly newsletter</p>
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="investor-contact__card">
            <h2 className="investor-contact__card-title">Contact Us</h2>
            <Formik
              initialValues={{ name: "", email: "", subject: "", message: "" }}
              validationSchema={contactSchema}
              validateOnBlur
              validateOnChange
              onSubmit={async (values, { resetForm, setSubmitting }) => {
                setSubmitting(true);
                try {
                  await contactService.submit({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    subject: values.subject.trim(),
                    message: values.message.trim(),
                  });
                  toast.success("Message sent successfully.");
                  resetForm();
                } catch (err: unknown) {
                  const ax = err as {
                    response?: {
                      status?: number;
                      data?: {
                        message?: string;
                        errors?: Record<string, string>;
                      };
                    };
                  };
                  const data = ax.response?.data;
                  if (data?.errors && typeof data.errors === "object") {
                    const first = Object.values(data.errors).find(
                      (v) => typeof v === "string"
                    );
                    toast.error(
                      (first as string) || data.message || "Validation failed."
                    );
                  } else {
                    toast.error(
                      data?.message || "Failed to send message. Please try again."
                    );
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ setFieldValue, values, errors, touched, isSubmitting, handleBlur }) => (
                <Form className="investor-contact__form" noValidate>
                  <InputField
                    label="Name"
                    name="name"
                    placeholder="Enter Name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                    onBlur={handleBlur}
                    error={touched.name && errors.name}
                    onInput={handleBlur}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Enter Email"
                    value={values.email}
                    onChange={(e) => setFieldValue("email", e.target.value)}
                    onBlur={handleBlur}
                    error={touched.email && errors.email}
                    onInput={handleBlur}
                  />
                  <InputField
                    label="Subject"
                    name="subject"
                    placeholder="Enter Subject"
                    value={values.subject}
                    onChange={(e) => setFieldValue("subject", e.target.value)}
                    onBlur={handleBlur}
                    error={touched.subject && errors.subject}
                    onInput={handleBlur}
                  />
                  <TextareaField
                    label="Message"
                    name="message"
                    placeholder="Enter Message"
                    value={values.message}
                    onChange={(e) => setFieldValue("message", e.target.value)}
                    onBlur={handleBlur}
                    rows={4}
                    error={touched.message && errors.message}
                  />
                  <CommonButton
                    type="submit"
                    title="Send"
                    fluid
                    className="investor-contact__submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  />
                </Form>
              )}
            </Formik>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
