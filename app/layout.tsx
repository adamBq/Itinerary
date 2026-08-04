import type { Metadata } from 'next';
import {
  Barlow_Condensed,
  Zen_Kaku_Gothic_New,
  IBM_Plex_Mono,
} from 'next/font/google';
import './globals.css';

const display = Barlow_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const zen = Zen_Kaku_Gothic_New({
  variable: '--font-zen',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Japan · Oct 29 – Nov 16',
  description: 'Shared, editable itinerary for our Japan trip.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${zen.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
