"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Tables } from "@/type/supabaseType";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface HeaderProps {
  user: Tables<"members"> | null;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Tables<"members"> | null>(initialUser); // user 상태 관리

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("로그아웃 중 오류가 발생했습니다.");
      } else {
        toast.success("로그아웃 되었습니다.");
        setUser(null);
        router.push("/");
      }
    } catch {
      toast.error("로그아웃 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="flex items-center justify-between w-full p-4">
      <div className="flex items-center sm:text-xl text-base font-bold">
        <Link href="/">
          <Image
            src={"/icon.png"}
            width={40}
            height={40}
            className="inline-block mr-2" alt={"아몬드qr 아이콘"}          />
          <span>아몬드QR</span>
        </Link>
      </div>
      <div className="flex space-x-4 mr-4">
        {user ? (
          <>
            {pathname !== '/u/mypage' && (
              <Link
                href="/u/mypage"
                className="text-gray-600 pt-2 sm:px-4 sm:py-2 rounded hover:bg-gray-200"
              >
                마이페이지
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-600 pt-2 sm:px-4 sm:py-2 rounded hover:bg-gray-200"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/u/signup"
              className="text-gray-600 pt-2 sm:px-4 sm:py-2 rounded hover:bg-gray-200"
            >
              회원가입
            </Link>
            <Link
              href="/u/signin"
              className="text-gray-600 pt-2 sm:px-4 sm:py-2 rounded hover:bg-gray-200"
            >
              로그인
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
