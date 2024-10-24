"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation"; // Next.js의 useRouter 사용
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner'

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // useRouter 훅 사용

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
      } else {
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      }

      setLoading(false);
    };

    getSession();

    // Supabase auth listener 설정
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_OUT") {
          router.push("u/signin"); // 로그아웃 시 로그인 페이지로 이동
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // 로그아웃 성공 시 toast 메시지 출력
      toast.success('로그아웃 되었습니다.')
      router.push("/"); // 로그아웃 후 홈으로 이동
    } catch {
      toast.error("로그아웃 실패, 관리자에게 문의 부탁드립니다.")
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {!loading ? children : <div>Loading...</div>}{" "}
      {/* 로딩 중일 때 로딩 메시지 */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
