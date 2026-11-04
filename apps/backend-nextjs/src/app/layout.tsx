import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickPhysio24.com API",
  description: "Backend API and services portal for QuickPhysio24.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#0f172a", color: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
