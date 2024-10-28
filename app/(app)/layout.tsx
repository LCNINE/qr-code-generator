import { getCurrentUser } from "@/utils/supabase/auth";
import Providers from "../Providers";
import "../globals.css";
import Header from "./Header";
import { ReactNode } from "react";
import { Tables } from "@/type/supabaseType";

export const metadata = {
  title: "아몬드QR",
  description: "정적QR코드와 동적QR코드를 발급하고, 발급한 동적QR을 관리 가능합니다.",
  icons: {
		icon: "/favicon/ms-icon-310x310.png",
	},
};

interface LayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: LayoutProps) {
  // requireAuth를 사용하여 사용자 데이터 가져오기
  const user: Tables<'members'> | null = await getCurrentUser();

  return (
    <html lang="ko-KR">
      <body>
        <Header user={user} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
