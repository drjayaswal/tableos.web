import type { Metadata, Viewport } from "next";
import { Geist_Mono, Source_Code_Pro, Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import { UserProvider } from "./context/UserContext";
import { NotificationProvider } from "./components/Notifcation";

const fontSans = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["400", "700", "900"],
});

const fontCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ff3131",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tableos.app"),
  title: {
    default: "TableOS",
    template: "%s | TableOS",
  },
  description: "Automate your hospitality business with TableOS. Reduce wait times by 60%, increase productivity, and offer a premium guest experience.",
  keywords: ["QR ordering", "hotel automation", "cafe management software", "contactless dining", "HORECA tech"],
  authors: [{ name: "TableOS Team" }],
  creator: "TableOS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tableos.app",
    siteName: "TableOS",
    title: "TableOS - High-Performance Hospitality Automation",
    description: "The OS for your tables. Faster service, happier guests.",
    images: [{ url: "/assets/tableOS-favicon.svg", width: 1200, height: 630, alt: "TableOS" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/tableOS-favicon.svg"],
  },
  icons: {
    icon: "/assets/tableOS-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TableOS",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "BusinessApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "120"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontCode.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        style={{
          backgroundImage: `radial-gradient(circle, var(--landing-grid) 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }}
        className="min-h-screen flex flex-col text-secondary font-sans selection:bg-black selection:text-white"
      >
        <Toaster
          toastOptions={{
            classNames: {
              icon: "hidden",
            },
            style: {
              width: "fit-content",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#000000",
              boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
            },
            actionButtonStyle: {
              background: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              padding: "6px 12px",
              marginLeft: "10px"
            },
            cancelButtonStyle: {
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              padding: "6px 12px",
              marginLeft: "6px"
            }
          }}
          position="bottom-right"
        />
        <UserProvider>
          <NotificationProvider>
            <Navbar />
            {children}
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}