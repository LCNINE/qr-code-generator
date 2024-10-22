import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <Link href="/">
          동적QR
        </Link>
      </div>
      <div className="flex space-x-4 mr-4">
        <Link href="/u/signup" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          회원가입
        </Link>
        <Link href="/u/signin" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          로그인
        </Link>
        <Link href="/u/mypage" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          마이페이지
        </Link>
      </div>
    </header>
  );
}
