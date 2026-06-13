import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: 'Baby Haus - Premium Baby Products in Cambodia',
  description: 'High-quality baby products imported from USA and Japan. Shop premium baby care, skincare, feeding essentials and toys. Order via Telegram for fast delivery in Cambodia.',
  keywords: 'baby products cambodia, baby care, baby skincare, imported baby products, usa baby products, japan baby products, baby haus',
  openGraph: {
    title: 'Baby Haus - Premium Baby Products in Cambodia',
    description: 'High-quality baby products imported from USA and Japan. Shop now!',
    url: 'https://babyhaus-catalog.vercel.app',
    siteName: 'Baby Haus',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baby Haus - Premium Baby Products in Cambodia',
    description: 'High-quality baby products imported from USA and Japan.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased pb-16 md:pb-0">
        <CartProvider>
          {children}
          <CartDrawer />
          <MobileBottomNav />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#2d2d2d',
                color: '#faf8f5',
                borderRadius: '12px',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}