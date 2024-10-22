import { supabase } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation'; // 리다이렉트를 위한 함수

interface QRCodePageProps {
  params: { id: string };
}

export default async function QRCodePage({ params }: QRCodePageProps) {
  // params를 비동기적으로 처리
  const { id } = await Promise.resolve(params);

  console.log('id : ', id);

  // Supabase에서 해당 id에 맞는 데이터를 가져옴
  const { data, error } = await supabase
    .from('qr_codes')
    .select('original_id')
    .eq('id', id)
    .single();

  if (error || !data) {
    return <p>QR 코드 데이터를 찾을 수 없습니다.</p>; // 에러 처리
  }

  const originalUrl = data.original_id;
  console.log('originalUrl : ', originalUrl);

  // 리다이렉트
  redirect(originalUrl);

  return null; // 리다이렉트 전까지는 페이지가 렌더링되지 않음
}
