import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Serving Factory | Torre de Control",
  description: "Plataforma de estructuración y gobernanza con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070A13] text-gray-200">
        {/* Background glow effects for entire app */}
        <div className="fixed top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
