import { ReactNode } from "react";

export const metadata = {
  title: "아몬드QR 마이페이지",
  description: "발급받은 동적 QR을 수정/삭제/다운로드하는 마이페이지",
};

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
