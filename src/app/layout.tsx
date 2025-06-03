import type { Metadata } from "next";
import "./tailwind-replacement.css";
import Navigation from "./_components/Navigation";

export const metadata: Metadata = {
  title: "Photo Booth",
  description: "A photo slideshow application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Navigation />
      </body>
    </html>
  );
}
