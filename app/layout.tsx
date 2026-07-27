import type { Metadata } from "next";
import { Mukta, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./lib/seo";
import ResourceHints from "./components/ResourceHints";

// Mukta covers both Latin and Devanagari, so the site's mixed English/Hindi
// text renders in one family. Not a variable font — weights are listed
// explicitly (400 body … 800 for the bold/extrabold headings the boards use).
const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Lets every child page write `alternates: { canonical: "/chart" }` and get a
  // fully qualified URL. Without it, relative metadata URLs are a build error.
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    // Child pages set a bare title; the brand is appended for them, so no page
    // ships a title that omits the brand.
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  category: "results",
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    site: SITE_NAME,
    creator: SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use a full-size thumbnail and an untruncated snippet —
      // both make the result take more vertical space and pull more clicks.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/**
 * Schema.org graph for the site itself. Gives Google an explicit brand name and
 * logo to attach to the sitelinks/knowledge panel instead of guessing them off
 * the page text.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: ["A13SATTA", "A13 Satta King", "a13satta"],
      description: HOME_DESCRIPTION,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: absoluteUrl("/icon"),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${mukta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ResourceHints />
        {children}
        <script
          type="application/ld+json"
          // Serialised from a literal we control, so there is no user input to
          // escape here.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
