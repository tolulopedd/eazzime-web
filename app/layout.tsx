import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { site } from "@/lib/content";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "EazziMe Technologies Inc. | Technology for What’s Next",
    template: "%s | EazziMe Technologies Inc.",
  },
  description: site.tagline,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.tagline,
    images: [{ url: "/social-share.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/social-share.png"] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
