'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, SignInSchema } from './schema'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Spinner } from '@/components/custom/spinner'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/custom/UnderlinedInput'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Separator } from '@radix-ui/react-context-menu'
import { toast } from 'sonner'

type SignInFormProps = {
  toastMessage?: string
}

export default function SignInForm({ toastMessage }: SignInFormProps) {
  const methods = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema)
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting }
  } = methods

  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const supabase = createClient() // 클라이언트 인스턴스 생성
  const nextUrl = searchParams.get('next') || '/' // next 파라미터가 없으면 기본으로 '/' 사용

  // toastMessage 또는 쿼리 파라미터의 오류 메시지 처리
  useEffect(() => {
    if (toastMessage) {
      toast.error(toastMessage)
    }

    const error = searchParams.get('error')
    const errorMessage = searchParams.get('error_description') || '알 수 없는 오류가 발생했습니다.'

    if (error) {
      console.error('이메일 인증 오류:', errorMessage)
      toast.error(errorMessage)
    }
  }, [toastMessage, searchParams])

  const onSubmit = async (data: SignInSchema) => {
    setLoading(true)
    const { email, password } = data

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        const errorMessage = getErrorMessage(signInError.status ?? 400, signInError.message)
        toast.error(`로그인 실패: ${errorMessage}`)
        return
      }


      // 로그인 성공 처리
      toast.success('로그인에 성공했습니다.')
      router.push(nextUrl)
    } catch (error) {
      console.error('로그인 중 에러:', error)
      toast.error('로그인 중 문제가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (status: number, message: string) => {
    if (status === 400) {
      if (message.includes('Invalid login credentials')) {
        return '잘못된 이메일 또는 비밀번호입니다.'
      } else if (message.includes('Email not confirmed')) {
        return '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
      } else {
        return '로그인에 실패했습니다. 입력 값을 확인해주세요.'
      }
    } else if (status === 401) {
      return '인증에 실패했습니다. 다시 시도해주세요.'
    } else if (status === 500) {
      return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    } else {
      return '알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.'
    }
  }

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
                {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">비밀번호</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-primary text-black py-2 rounded-md font-bold transition duration-150"
          >
            {loading ? <Spinner /> : '로그인'}
          </Button>

          {/* <div className="text-center mt-4">
            <Link href="/auth/recovery" className={cn('w-full', buttonVariants({ variant: 'link' }))}>
              비밀번호를 잊으셨나요?
            </Link>
          </div> */}

          <div className="mt-4 text-center">
            <Separator />
            <p className="text-xs text-muted-foreground">아직 회원이 아니신가요?</p>
            <Separator className="flex-1" />

            <Link href="/u/signup" className={cn('w-full', buttonVariants({ variant: 'link' }))}>
              회원가입
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
