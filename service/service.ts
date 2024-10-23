import { createSupabaseClient as createSupabaseClientUtil } from '@/utils/supabase/createClient'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/type/supabaseType'

// 런타임 환경에 따라 서버 또는 클라이언트 구분
abstract class Service {
  protected supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createSupabaseClientUtil()
  }
}

export default Service

// utils/supabase/createClient.ts

import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { headers, cookies } = require('next/headers')
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          ...Object.fromEntries(headers().entries()),
          Cookie: cookies().toString()
        }
      }
    })
  } else {
    return createClient(supabaseUrl, supabaseKey)
  }
}
