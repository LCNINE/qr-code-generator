import { ReactNode } from "react";

export const metadata = {
  title: "아몬드QR 회원가입",
  description: "아몬드QR의 주요 기능 사용을 위한 회원가입 페이지",
};

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
