"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useState } from "react";
import {  useQueryClient } from "@tanstack/react-query";
import { useQrs, useUpdateQr } from "@/service/qr/useQrs";
import { Spinner } from "@/components/custom/spinner";

interface QRCodeData {
  id: string;
  name: string;
  original_id: string;
  qrUrl: string;
}

export default function ModifyQR({ memberId }: { memberId: string }) {
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");
  const queryClient = useQueryClient();

  // useQrs 훅에서 데이터를 가져옴
  const { data: qrCodes, isLoading, isError } = useQrs(memberId);
  const updateQRMutation = useUpdateQr()
  

  const handleEdit = (qrCode: QRCodeData) => {
    setSelectedQR(qrCode);
    setNewName(qrCode.name);
    setNewUrl(qrCode.original_id);
  };

  const handleSaveChanges = () => {
    if (!selectedQR) return;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    updateQRMutation.mutate(
      { newName, newUrl, selectedQRId: selectedQR.id },
      {
        onSuccess: () => {
          alert("QR 코드가 수정되었습니다.");
          queryClient.invalidateQueries({ queryKey: ["qrCodes", memberId] }); // QR 코드 새로고침을 위해 쿼리 무효화
          setSelectedQR(null); // Reset selected QR
        },
        onError: error => {
          console.error("Error updating QR code:", error.message);
        },
        onSettled: () => {
        }
      }
    )
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

  // 로딩 중일 때 Spinner 표시
  if (isLoading) return <Spinner />;

  // 오류가 발생했을 때 오류 메시지 표시
  if (isError) return <p>데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="h-full">
      <div className="h-full">
        <h1 className="text-2xl font-bold mb-4">내 QR 코드</h1>
        {Array.isArray(qrCodes) && qrCodes.length === 0 ? (
          <p>생성된 QR 코드가 없습니다.</p>
        ) : Array.isArray(qrCodes) ? (
          <ul>
            {qrCodes.map((qrCode: QRCodeData) => (
              <li key={qrCode.id} className="mb-4">
                <p>이름: {qrCode.name}</p>
                <p>URL: {qrCode.original_id}</p>
                <QRCode
                  id={`qr-code-${qrCode.id}`}
                  value={qrCode.qrUrl}
                  className="mb-2"
                />
                <Button
                  onClick={() => handleEdit(qrCode)}
                  className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  수정
                </Button>
                <Button
                  onClick={() => downloadQRCode(qrCode)}
                  className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 ml-2"
                >
                  다운로드
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
        )}
      </div>

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
          <Button
            onClick={handleSaveChanges}
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            저장
          </Button>
        </div>
      )}
    </div>
  );
}
