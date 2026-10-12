import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import Install from "../components/Install";
export const metadata: Metadata = {
  title: "Luhach Parivar · Our family, together",
  description:
    "A living family archive. Explore your roots and help complete our shared story.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#234b3e",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <nav className="site-nav" aria-label="Website navigation">
          <Link className="site-brand" href="/">
            लुहाच <span>PARIVAR</span>
          </Link>
          <div>
            <Link href="/">Home / मुख्य पृष्ठ</Link>
            <Link href="/members">Family & account</Link>
            <Link href="/vanshavali">Dynasty viewer / वंशावली</Link>
            <Link href="/community">Community / समुदाय</Link>
            <Install />
          </div>
        </nav>
        {children}
        <footer className="site-footer">
          <strong>लुहाच परिवार</strong>
          <p>A living archive · Local review only · Public website unchanged</p>
          <Link href="/members">Account & privacy</Link>
          <span> · </span>
          <Link href="/demo">Fictional family sandbox</Link>
        </footer>
      </body>
    </html>
  );
}
