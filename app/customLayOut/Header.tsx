import Link from "next/link";
import React from "react";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { user, signOut } = useAuth(); // 로그인된 유저 정보와 로그아웃 함수 가져오기

  return (
    <header className="flex items-center justify-between w-full p-4 bg-gray-100">
      <div className="flex items-center">
        <Link href="/">동적QR</Link>
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
              onClick={signOut}
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
