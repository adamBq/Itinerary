import type { Metadata } from 'next';
import {
  Bricolage_Grotesque,
  Zen_Kaku_Gothic_New,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

const zen = Zen_Kaku_Gothic_New({
  variable: '--font-zen',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
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
      className={`${bricolage.variable} ${zen.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
