import { createClient } from "@/utils/supabase/server";
import SignInForm from "./components";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  // 프로필 확인 후 리다이렉트
  if (authData.user?.id) {
    const redirectTo = searchParams?.redirect_to;
    console.log("로그인 성공, 리다이렉트:", redirectTo || "/");
    return redirect(redirectTo || "/");
  }
  return <SignInForm />;
}
