'use client'

import { useQuery } from '@tanstack/react-query'
import { qrQueryOptions } from './queries'

export const useQrs = (memberId: string) => {
  return useQuery(qrQueryOptions.qrCodes(memberId))
}
