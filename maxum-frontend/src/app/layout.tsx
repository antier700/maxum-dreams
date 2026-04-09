import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import { Providers } from "@/lib/redux/providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeScript } from "@/components/ThemeScript";
import { ToastProvider } from "@/components/common/ui/toast/ToastProvider";
import "./globals.scss";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maxum Dreams",
  description: "Maxum Dreams - The Future of Staking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${roboto.className}`} suppressHydrationWarning>
        <ThemeScript />
        <Providers>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
