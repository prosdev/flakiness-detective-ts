import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flakiness Detective | AI-Powered Test Flakiness Detection',
  description:
    'Identify and resolve flaky tests using semantic embeddings and density-based clustering. Open source test reliability tool for Playwright and beyond.',
  keywords: [
    'test flakiness',
    'flaky tests',
    'test automation',
    'playwright',
    'ci/cd',
    'test reliability',
    'AI testing',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
