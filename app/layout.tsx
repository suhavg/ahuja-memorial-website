import './globals.css';
import type { Metadata } from 'next';
import { EB_Garamond } from 'next/font/google';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-eb-garamond',
});

export const metadata: Metadata = {
  title: 'Deepak & Madhu Ahuja | In Loving Memory',
  description: 'A memorial for Deepak and Madhu Ahuja, with memories and photos shared by family and friends.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ebGaramond.variable}>
      <body>{children}</body>
    </html>
  );
}
