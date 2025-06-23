// app/layout.tsx
// import './globals.css';
import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Raspberry Pi Dashboard',
  description: 'Network and system monitoring dashboard for Raspberry Pi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body suppressHydrationWarning={true}>
        <main>{children}</main>
      </body>
    </html>
  );
}
