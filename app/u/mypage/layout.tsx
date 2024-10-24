import { ReactNode } from "react";

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}