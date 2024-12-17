"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/custom/UnderlinedInput";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-context-menu";
import Link from "next/link";
import { toast } from "sonner";
import { SignUpSchema } from "./schema";
import MemberService from "@/service/member/memberService";
import { createClient } from "@/utils/supabase/client";

// 이메일과 비밀번호만을 위한 스키마
const EmailPasswordSchema = SignUpSchema.pick({
  email: true,
  password: true,
  rePassword: true,
});

type SignUpFormData = z.infer<typeof EmailPasswordSchema>;

export default function SignUpForm() {
  const supabse = createClient()
  const memberService = new MemberService(supabse);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(EmailPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      rePassword: "",
    },
  });

  const signUpErrorMessages = {
    "Invalid email or password": "유효하지 않은 이메일 또는 비밀번호입니다.",
    "Email already registered": "이미 등록된 이메일입니다.",
    "Password should be at least 6 characters":
      "비밀번호는 최소 6자 이상이어야 합니다.",
    "User already exists": "이미 존재하는 사용자입니다.",
    "Invalid email format": "유효하지 않은 이메일 형식입니다.",
    "Server error, please try again later":
      "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  };

  const handleSignUpError = (error: { message: string }) => {
    const mappedMessage =
      signUpErrorMessages[error.message as keyof typeof signUpErrorMessages] ||
      "회원가입 중 문제가 발생했습니다. 다시 시도해주세요.";
    toast.error(`회원가입 실패: ${mappedMessage}`);
  };

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);

    const { email, password } = data;

    try {
      // 회원가입 요청
      const { data: signUpData, error: signUpError } = await memberService.signUpUser({
        email,
        password,
      });

      if (signUpError) {
        handleSignUpError(signUpError);
      } else if (signUpData) {
        const userId = signUpData.user?.id ?? "";
        const insertError = await memberService.insertMember({ userId, email });

        if (insertError) throw insertError;

        toast.success("회원가입 성공");
        router.push("/u/signin");
      }
    } catch (error) {
      console.error("회원가입 중 에러:", error);
      toast.error("회원가입 요청 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 shadow-lg rounded-lg">
      <h2 className="text-3xl font-medium text-center mb-6 text-black dark:text-white">
        회원가입
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 이메일 입력 */}
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">이메일</FormLabel>
                <FormControl>
                  <Input
                    className={`border-b ${
                      form.formState.errors.email
                        ? "border-red-600"
                        : form.formState.dirtyFields.email
                        ? "border-secondary"
                        : "border-gray-400"
                    }`}
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-gray-400 text-xs">
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* 비밀번호 입력 */}
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className={`border-b ${
                      form.formState.errors.password
                        ? "border-red-600"
                        : form.formState.dirtyFields.password
                        ? "border-secondary"
                        : "border-gray-400"
                    }`}
                    placeholder="******"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-gray-400 text-xs">
                  {form.formState.errors.password?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* 비밀번호 확인 입력 */}
          <FormField
            name="rePassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  비밀번호 확인
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className={`border-b ${
                      form.formState.errors.rePassword
                        ? "border-red-600"
                        : form.formState.dirtyFields.rePassword
                        ? "border-secondary"
                        : "border-gray-600"
                    }`}
                    placeholder="******"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-gray-400 text-xs">
                  {form.formState.errors.rePassword?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black py-2 rounded-md font-bold transition duration-150"
          >
            {loading ? "가입 중..." : "회원가입"}
          </Button>

          <div className="my-4 flex flex-row items-center">
            <Separator className="flex-1" />
            <p className="text-xs text-muted-foreground">계정이 있으신가요?</p>
            <Separator className="flex-1" />
          </div>

          <Link
            href="/u/signin"
            className={cn("w-full", buttonVariants({ variant: "link" }))}
          >
            기존 계정으로 로그인
          </Link>
        </form>
      </Form>
    </div>
  );
}
