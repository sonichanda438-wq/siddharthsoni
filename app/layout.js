import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "./LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO metadata
export const metadata = {
  title: "Siddharth Soni | Freelance Website Designer & Developer in Jaipur",
  description:
    "Wondering how much it costs to hire a developer for a website? Get professional, high-performance, and custom ecommerce website design services in India & globally.",
  keywords: [
    "website designer in jaipur",
    "freelance website developer",
    "ecommerce website developer",
    "shopify website developer",
    "custom website developer",
    "hire a website designer",
    "professional website designer",
    "best website developer in india",
    "website design services",
    "freelance website designer",
  ],
  openGraph: {
    title: "Siddharth Soni | Professional Website Designer & Developer",
    description:
      "Looking for a website developer? I provide expert custom UI/UX, fast-loading frontend, and e-commerce website development services.",
    url: "https://siddharthsoni.pages.dev",
    siteName: "S.S. Creative Portfolio",
    type: "website",
  },
};

// FAQ structured data
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does it cost to hire a developer for a website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The cost of hiring a website developer varies based on the project. A custom freelance web designer offers flexible pricing, ranging from affordable landing pages to premium e-commerce and high-performance UI/UX projects.",
      },
    },
    {
      "@type": "Question",
      name: "What does a website developer do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A website developer builds and maintains websites, focusing on lightning-fast code, responsive UI/UX layouts, custom animations, and conversion-optimized architectures using modern technologies.",
      },
    },
    {
      "@type": "Question",
      name: "Will AI or ChatGPT replace web developers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While AI tools like ChatGPT can assist with basic tasks, they cannot replace the complex strategy, interactive UI/UX design, and deep performance optimization that a professional freelance website developer provides.",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
