"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInSchema } from "./schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/custom/spinner";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/custom/UnderlinedInput";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Separator } from "@radix-ui/react-context-menu";
import { toast } from "sonner";
import MemberService from "@/service/member/memberService";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type SignInFormProps = {
  toastMessage?: string;
};

export default function SignInForm({ toastMessage }: SignInFormProps) {
  const memberService = new MemberService();

  const methods = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "", // 초기값 설정
      password: "", // 초기값 설정
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // toastMessage 또는 쿼리 파라미터의 오류 메시지 처리
  useEffect(() => {
    if (toastMessage) {
      toast.error(toastMessage);
    }

    const error = searchParams.get("error");
    const errorMessage =
      searchParams.get("error_description") ||
      "알 수 없는 오류가 발생했습니다.";

    if (error) {
      console.error("이메일 인증 오류:", errorMessage);
      toast.error(errorMessage);
    }
  }, [toastMessage, searchParams]);

  const onSubmit = async (data: SignInSchema) => {
    setLoading(true);
    const { email, password } = data;

    try {
      const signInResult = await memberService.signInUser({ email, password });

      // signInResult가 AuthError의 인스턴스인지 확인
      if (signInResult instanceof AuthError) {
        const errorMessage = getErrorMessage(
          signInResult.status ?? 400,
          signInResult.message
        );
        toast.error(`로그인 실패: ${errorMessage}`);
        return;
      } else {
        // 로그인 성공 후 세션 정보 확인
        const user = await supabase.auth.getUser();
        console.log("로그인된 사용자 정보:", user);
  
        toast.success("로그인에 성공했습니다.");
        router.push("/");
      }
    } catch (error) {
      console.error("로그인 중 에러:", error);
      toast.error("로그인 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (status: number, message: string) => {
    if (status === 400) {
      if (message.includes("Invalid login credentials")) {
        return "잘못된 이메일 또는 비밀번호입니다.";
      } else {
        return "로그인에 실패했습니다. 입력 값을 확인해주세요.";
      }
    } else if (status === 401) {
      return "인증에 실패했습니다. 다시 시도해주세요.";
    } else if (status === 500) {
      return "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } else {
      return "알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.";
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 shadow-lg rounded-lg">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">이메일</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">비밀번호</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                {errors.password && (
                  <FormMessage>{errors.password.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-primary text-black py-2 rounded-md font-bold transition duration-150"
          >
            {loading ? <Spinner /> : "로그인"}
          </Button>

          <div className="text-center mt-4">
            <Link
              href="/auth/recovery"
              className={cn("w-full", buttonVariants({ variant: "link" }))}
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Separator />
            <p className="text-xs text-muted-foreground">
              아직 회원이 아니신가요?
            </p>
            <Separator className="flex-1" />

            <Link
              href="/u/signup"
              className={cn("w-full", buttonVariants({ variant: "link" }))}
            >
              회원가입
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
