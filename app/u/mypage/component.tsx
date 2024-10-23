"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/customLayOut/AuthContext";
import QRCode from "react-qr-code";
import QRService from "@/service/qr/qrService";
import { useState } from "react"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QR_QUERY } from "@/service/qr/queries";

interface QRCodeData {
  id: string;
  name: string;
  original_id: string;
  qrUrl: string;
}

export default function ModifyQR() {
  const { user } = useAuth();
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");

  const qrService = new QRService();
  const queryClient = useQueryClient();

  // Fetch QR Codes using react-query
  const { data: qrCodes = [], isLoading } = useQuery(
    {
      queryKey: [QR_QUERY.QRCODES, user?.id],
      queryFn: () => qrService.fetchQR(user!),
      enabled: !!user
    }
  );

  // QR 코드 업데이트를 위한 react-query 사용
  const updateQRMutation = useMutation({
    mutationFn: ({ newName, newUrl, selectedQRId }: { newName: string; newUrl: string; selectedQRId: string }) =>
      qrService.updateQR({ newName, newUrl, selectedQRId }),
    onSuccess: () => {
      alert("QR 코드가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: [QR_QUERY.QRCODES, user?.id] }); // QR 코드 새로고침을 위해 쿼리 무효화
        setSelectedQR(null); // Reset selected QR
      },
      onError: (error: Error) => {
        console.error("Error updating QR code:", error.message);
      },
    }
  );

  const handleEdit = (qrCode: QRCodeData) => {
    setSelectedQR(qrCode);
    setNewName(qrCode.name);
    setNewUrl(qrCode.original_id);
  };

  const handleSaveChanges = () => {
    if (!selectedQR) return;
    updateQRMutation.mutate({ newName, newUrl, selectedQRId: selectedQR.id });
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    const svg = document.getElementById(`qr-code-${qrCode.id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${qrCode.name}.png`;
        a.click();
        a.remove();
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-4">내 QR 코드</h1>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : qrCodes?.length === 0 ? (
        <p>생성된 QR 코드가 없습니다.</p>
      ) : (
        <ul>
          {qrCodes?.map((qrCode: QRCodeData) => (
            <li key={qrCode.id} className="mb-4">
              <p>이름: {qrCode.name}</p>
              <p>URL: {qrCode.original_id}</p>
              <QRCode id={`qr-code-${qrCode.id}`} value={qrCode.qrUrl} className="mb-2" />
              <Button onClick={() => handleEdit(qrCode)} className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                수정
              </Button>
              <Button onClick={() => downloadQRCode(qrCode)} className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 ml-2">
                다운로드
              </Button>
            </li>
          ))}
        </ul>
      )}

      {selectedQR && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">QR 코드 수정</h2>
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="QR 코드 이름"
            className="mb-4 w-full border border-gray-300 rounded p-2"
          />
          <Input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="QR 코드 URL"
            className="mb-4 w-full border border-gray-300 rounded p-2"
          />
          <Button onClick={handleSaveChanges} className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
            저장
          </Button>
        </div>
      )}
    </div>
  );
}
