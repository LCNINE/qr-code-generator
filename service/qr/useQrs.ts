'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { qrQueryOptions } from './queries'

export const useQrs = (memberId: string) => {
  return useQuery(qrQueryOptions.qrCodes(memberId))
}

export const useUpdateQr = () => {

  return useMutation({
    ...qrQueryOptions.updateQR()
  })
}
