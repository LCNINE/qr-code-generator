import { NextResponse } from 'next/server'; // 리다이렉트를 위한 Next.js 함수
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params;

  // Supabase에서 해당 id에 맞는 데이터를 가져옴
  const { data, error } = await supabase
    .from('qr_codes')
    .select('original_id')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: 'QR 코드 데이터를 찾을 수 없습니다.' }, { status: 404 });
  }

  const originalUrl = data.original_id;

  // 리다이렉트
  return NextResponse.redirect(originalUrl);
}

