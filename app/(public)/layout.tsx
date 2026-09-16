import type { Metadata } from "next";
// import Navbar from "@/components/public/Navbar";
// import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: {
    default: "SS Executive — Premium Apparel Manufacturing",
    template: "%s | SS Executive",
  },

  description:
    "SS Executive — custom T-shirts, corporate apparel & bulk garment manufacturing. Quality and comfort, delivered.",

  keywords: [
    "SS Executive",
    "apparel manufacturer",
    "garment manufacturer",
    "custom T-shirts",
    "custom apparel",
    "corporate apparel",
    "bulk garment manufacturing",
    "custom clothing manufacturer",
    "T-shirt manufacturer",
    "corporate uniforms",
    "bulk T-shirt manufacturer",
  ],

  authors: [
    {
      name: "SS Executive",
      url: "https://www.ssexecutive.in",
    },
  ],

  creator: "SS Executive",
  publisher: "SS Executive",

  metadataBase: new URL("https://www.ssexecutive.in"),

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://www.ssexecutive.in/",
    siteName: "SS Executive",
    title: "SS Executive — Premium Apparel Manufacturing",
    description:
      "Custom T-shirts, corporate apparel and bulk garment manufacturing by SS Executive.",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "SS Executive — Premium Apparel Manufacturing",
    description:
      "Custom T-shirts, corporate apparel & bulk garment manufacturing.",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Navbar /> */}
      <main>{children}</main>
      {/* <Footer /> */}
    </>
  );
}