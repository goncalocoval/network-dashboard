// app/layout.tsx
// import './globals.css';
import { ReactNode } from 'react';
import './globals.css'; // <- Muito importante que isto esteja aqui!

export const metadata = {
  title: 'Network Dashboard',
  description: 'Painel de gestão de dispositivos',
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
