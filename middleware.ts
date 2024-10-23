import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // updateSession 함수를 가져옵니다.

export async function middleware(request: NextRequest) {
  // 요청의 헤더에 현재 URL 정보를 추가합니다.
  request.headers.set('x-url', request.url)

  // updateSession 함수를 호출하여 요청을 처리합니다.
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청 경로에 대해 미들웨어를 적용합니다.
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * 필요에 따라 이 패턴에 더 많은 경로를 추가하여 수정할 수 있습니다.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}