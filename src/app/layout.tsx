// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Simple Test Tracker',
  description: 'A simple test management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
