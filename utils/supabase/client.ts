import { Database } from '@/type/supabaseType'
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true, // 세션 유지 활성화
      autoRefreshToken: true // 토큰 자동 갱신 활성화
    }
  })
