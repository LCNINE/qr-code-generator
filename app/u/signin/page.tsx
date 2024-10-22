'use client'

import { createClient } from '@/utils/supabase/client' // 클라이언트용 Supabase 인스턴스 사용
import SignInForm from './components'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()

      // 현재 사용자의 세션 가져오기
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      // 세션 확인 중 오류가 발생한 경우
      if (sessionError) {
        console.error('세션 확인 중 오류 발생:', sessionError.message)
        return
      }

      // 유효한 세션인지 구체적으로 검사 - 세션이 존재하지만 세션이 만료된 경우도 처리 필요
      if (sessionData && sessionData.session) {
        console.log('모든 조건을 충족했습니다. 홈으로 리다이렉트합니다.')
        router.push('/')
      }
    }

    checkSession()
  }, [router])

  return <SignInForm />
}
