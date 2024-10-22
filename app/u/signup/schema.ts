import { z } from 'zod'

export const SignUpSchema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력하세요.' }),
  password: z.string().min(6, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
  rePassword: z.string().min(6, { message: '비밀번호 확인은 최소 8자 이상이어야 합니다.' })
})

// 이 타입을 생성하여 외부에서 사용할 수 있게 만듭니다.
export type SignUpFormData = z.infer<typeof SignUpSchema>
