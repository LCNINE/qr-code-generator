import QRService from "./qrService";

export const queryKeys = {
  qrCodes: (memberId: string) => ['qrCodes', { memberId }] as const,
};

export const qrQueryOptions = {
  qrCodes: (memberId: string) => ({
    queryKey: queryKeys.qrCodes(memberId),
    queryFn: () => new QRService().fetchQR(memberId), // 인스턴스를 생성하여 메서드 호출
  }),
  updateQR: () =>({
    mutationFn: ({newName, newUrl, selectedQRId,}:{newName: string; newUrl: string; selectedQRId: string;}) => new QRService().updateQR({newName, newUrl, selectedQRId})
  })
};
