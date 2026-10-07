import type { Metadata } from "next";
import { JetBrains_Mono, Saira } from "next/font/google";
import "./globals.css";

const saira = Saira({ subsets: ["latin"], axes: ["wdth"], variable: "--font-saira" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "F1 Reaction Tracker",
  description: "Five lights, three starts, one average. Test your F1 start reaction time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${saira.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
