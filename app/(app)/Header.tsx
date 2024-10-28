"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Tables } from "@/type/supabaseType";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: Tables<"members"> | null;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const supabase = createClient();
  const router = useRouter();
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
    <header className="flex items-center justify-between w-full p-4 bg-gray-100">
      <div className="flex items-center">
        <Link href="/">아몬드QR</Link>
      </div>
      <div className="flex space-x-4 mr-4">
        {user ? (
          <>
            <Link
              href="/u/mypage"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              마이페이지
            </Link>
            <button
              onClick={handleLogout}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/u/signup"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              회원가입
            </Link>
            <Link
              href="/u/signin"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              로그인
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
