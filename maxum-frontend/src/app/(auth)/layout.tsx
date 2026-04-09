import type { Metadata } from "next";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Authentication - Maxum Dreams",
  description: "Sign in to your Maxum Dreams workspace",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={roboto.className}>
      {children}
    </div>
  );
}
