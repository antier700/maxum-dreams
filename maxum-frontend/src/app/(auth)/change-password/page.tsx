import { Suspense } from "react";
import ChangePasswordForm from "@/app/(auth)/change-password/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}
