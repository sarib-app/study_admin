import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Study Pilot Admin",
  description: "Study Pilot admin dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="relative min-h-full bg-bg text-ink">
        <div className="studypilot-glow" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
