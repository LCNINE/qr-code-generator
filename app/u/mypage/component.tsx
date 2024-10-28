"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQrs, useUpdateQr } from "@/service/qr/useQrs";
import { Spinner } from "@/components/custom/spinner";
import QRService from "@/service/qr/qrService";

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
  const qrService = new QRService();

  // useQrs 훅에서 데이터를 가져옴
  const { data: qrCodes, isLoading, isError } = useQrs(memberId);
  const updateQRMutation = useUpdateQr();

  const handleEdit = (qrCode: QRCodeData) => {
    setSelectedQR(qrCode);
    setNewName(qrCode.name);
    setNewUrl(qrCode.original_id);
  };

  const handleSaveChanges = () => {
    if (!selectedQR) return;
    updateQRMutation.mutate(
      { newName, newUrl, selectedQRId: selectedQR.id },
      {
        onSuccess: () => {
          alert("QR 코드가 수정되었습니다.");
          queryClient.invalidateQueries({ queryKey: ["qrCodes", memberId] }); // QR 코드 새로고침을 위해 쿼리 무효화
          setSelectedQR(null); // 선택된 QR 초기화
          window.location.reload(); // QR 코드 삭제 후 페이지 새로고침
        },
        onError: (error) => {
          console.error("QR 코드 수정 중 오류 발생:", error.message);
        },
      }
    );
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

  const deleteQRCode = async (qrCode: QRCodeData) => {
    const deleteCon = confirm('정말 삭제하시겠습니까?');
    if (deleteCon) {
      const deleteResult = await qrService.deleteQR({ selectedQRId: qrCode.id });
      if (deleteResult != null) {
        console.error("Failed to delete QR code.");
      } else {
        console.log("QR code deleted successfully.");
        queryClient.invalidateQueries({ queryKey: ["qrCodes", memberId] }); // QR 코드 새로고침을 위해 쿼리 무효화
        setSelectedQR(null); // 선택된 QR 초기화
        window.location.reload(); // QR 코드 삭제 후 페이지 새로고침
      }
    } else {
      return;
    }
  };

  // 로딩 중일 때 Spinner 표시
  if (isLoading) return <Spinner />;

  // 오류가 발생했을 때 오류 메시지 표시
  if (isError) return <p>데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="h-full">
      <div className="text-3xl w-full border-2 p-2 bg-blue-500 text-white">
        QR 목록
      </div>
      <div className="flex justify-around mt-4">
        {Array.isArray(qrCodes) && qrCodes.length === 0 ? (
          <p>생성된 QR 코드가 없습니다.</p>
        ) : Array.isArray(qrCodes) ? (
          qrCodes.map((qrCode: QRCodeData) => (
            <div
              key={qrCode.id}
              className="w-[45%] min-w-[40%] mb-4 p-4 border border-gray-200 rounded-lg shadow-md inline-block"
            >
              <div className="flex items-start">
                <QRCode
                  id={`qr-code-${qrCode.id}`}
                  value={qrCode.qrUrl}
                  className="mb-2"
                />
                <div className="ml-4 flex-1">
                  <div>
                    <p>이름:</p>
                    <Input
                      type="text"
                      value={
                        selectedQR?.id === qrCode.id ? newName : qrCode.name
                      }
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={selectedQR?.id !== qrCode.id}
                      className="mb-2 w-full border border-gray-300 rounded p-2"
                    />
                    <p>URL:</p>
                    <Input
                      type="text"
                      value={
                        selectedQR?.id === qrCode.id
                          ? newUrl
                          : qrCode.original_id
                      }
                      onChange={(e) => setNewUrl(e.target.value)}
                      disabled={selectedQR?.id !== qrCode.id}
                      className="mb-2 w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {selectedQR?.id === qrCode.id ? (
                      <Button
                        onClick={handleSaveChanges}
                        className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
                      >
                        저장
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleEdit(qrCode)}
                          className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
                        >
                          수정
                        </Button>
                        <Button
                          onClick={() => downloadQRCode(qrCode)}
                          className="bg-yellow-500 text-white py-1 px-4 rounded hover:bg-yellow-600"
                        >
                          다운로드
                        </Button>
                        <Button
                          onClick={() => deleteQRCode(qrCode)}
                          className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
                        >
                          삭제
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
