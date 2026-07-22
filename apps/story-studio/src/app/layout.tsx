import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'Storynaram Studio', template: '%s | Storynaram Studio' },
  description: 'AI-Powered Story IDE',
  metadataBase: new URL('https://storynaram.com'),
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.svg' },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Storynaram Studio',
    description: 'AI-Powered Story IDE',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Storynaram Studio',
    description: 'AI-Powered Story IDE',
    images: ['/twitter-image.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
