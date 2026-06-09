import type { Metadata } from "next";
import { Outfit, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "IntelliMeet | Intelligent Meeting Intelligence & Escalation Tracking",
  description: "AI-Powered Meeting Ingestion, OCR Text Extraction, SQLite Storage, ChromaDB Vector Search, and Risk Scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="bg-bg-slate text-foreground flex min-h-screen font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-64">
          <Navbar />
          <main className="flex-1 pt-24 pb-12 px-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
