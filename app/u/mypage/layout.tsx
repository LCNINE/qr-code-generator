import { ReactNode } from "react";
import { requireAuth } from "@/utils/supabase/auth";
import Header from "@/app/(app)/Header";

export const metadata = {
  title: "아몬드QR 마이페이지",
  description: "발급받은 동적 QR을 수정/삭제/다운로드하는 마이페이지",
};

interface LayoutProps {
  children: ReactNode;
}

export default async function MyPageLayout({ children }: LayoutProps) {
  const user = await requireAuth();
  return (
    <div>
      <Header user={user.user} />
      <main>{children}</main>
    </div>
  );
}
