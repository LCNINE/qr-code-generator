import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
})

export type SignInSchema = z.infer<typeof signInSchema>
