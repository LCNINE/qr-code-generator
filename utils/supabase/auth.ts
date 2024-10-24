import { createClient } from './server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Tables } from '@/type/supabaseType'

export const getCurrentUser = async (): Promise<Tables<'members'> | null> => {
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) {
    return null
  }
  const { data: userData, error: userError } = await supabase
    .from('members')
    .select('*')
    .eq('id', authData.user.id)
    .single()
  if (userError) {
    redirect('/u/sign-in')
  }
  return userData
}

export const requireAuth = async (): Promise<{
  user: Tables<'members'>
}> => {
  const currentUser = await getCurrentUser()
  if (currentUser == null) {
    const headerList = headers()
    redirect(
      `/u/signin?redirect_to=${encodeURIComponent(headerList.get('x-url') ?? '')}&message=${encodeURIComponent('로그인이 필요한 기능입니다.')}`
    )
  }
  return { user: currentUser }
}
