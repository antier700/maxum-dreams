import { Suspense } from "react";
import VerifyCodeForm from "@/app/(auth)/verify-code/VerifyCodeForm";

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCodeForm />
    </Suspense>
  );
}
