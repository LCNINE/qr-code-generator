import { createClient } from '@supabase/supabase-js'

// 서버 전용 Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // 세션 유지
    autoRefreshToken: true // 자동으로 리프레시 토큰을 갱신
  }
})

// User Metadata 타입 정의
interface UserMetadata {
  displayname?: string
  cell_phone?: string
}

// 현재 사용자 정보를 가져오는 함수
export const getCurrentUser = async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    console.error('사용자 인증 정보 조회 실패:', authError?.message)
    return null
  }

  // 사용자 정보를 members 테이블에서 가져옴
  const { data: userData, error: userError } = await supabase
    .from('members')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (userError) {
    console.warn('members 테이블에서 사용자 정보를 찾을 수 없습니다. 새로 삽입을 시도합니다.')
    const insertResult = await insertNewMember(
      authData.user.id,
      authData.user.email ?? '',
      authData.user.user_metadata as UserMetadata
    )

    if (insertResult.error) {
      console.error('새 사용자 삽입 실패:', insertResult.error.message)
      return null
    }
  }

  return authData.user
}

// 새로운 회원 정보를 members 테이블에 삽입하는 함수
export const insertNewMember = async (userId: string, email: string, userMetadata: UserMetadata) => {
  const displayname = userMetadata?.displayname ?? ''
  const cell_phone = userMetadata?.cell_phone ?? ''

  const { error } = await supabase.from('members').insert({
    id: userId,
    username: displayname || email.split('@')[0], // 기본값으로 이메일 ID를 사용
    cell_phone: cell_phone, // 사용자 휴대폰 번호
    membership_status: false, // 기본적으로 비활성 상태
    created_at: new Date().toISOString()
  })

  if (error) {
    console.error('회원 정보 삽입 실패:', error.message)
  }

  return { error }
}
