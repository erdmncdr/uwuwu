import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { I18nProvider } from "@/components/providers/i18n-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Quiz Tournament - Create & Play Worldcup-Style Quizzes",
  description:
    "Create and play interactive worldcup-style quizzes. Choose your favorites and discover what wins!",
  keywords: [
    "quiz",
    "tournament",
    "worldcup",
    "game",
    "voting",
    "interactive",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <I18nProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
