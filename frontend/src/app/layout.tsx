import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Catalyst — AI Talent Scouting Agent",
  description: "AI-powered recruiter agent that discovers matching candidates, assesses genuine interest, and delivers a ranked shortlist in minutes.",
  keywords: ["AI recruiting", "talent scouting", "candidate matching", "HR tech"],
  openGraph: {
    title: "Catalyst — AI Talent Scouting",
    description: "Find, match and engage top candidates with AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1E1E2A",
              color: "#F8F8FF",
              border: "1px solid #3A3A50",
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
            },
            success: { iconTheme: { primary: "#10B981", secondary: "#0A0A0F" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#0A0A0F" } },
          }}
        />
      </body>
    </html>
  );
}
