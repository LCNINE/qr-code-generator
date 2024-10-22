"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/customLayOut/AuthContext";
import QRCode from "react-qr-code";


interface QRCodeData {
  id: string;
  name: string;
  original_id: string;
  qrUrl: string;
}

export default function MyPage() {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchQRCodes();
    }else{
      alert("로그인이 필요합니다.");
    }
  }, [user]);

  const fetchQRCodes = async () => {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching QR codes:", error.message);
    } else {
      const qrCodesWithUrl = data.map((qrCode: QRCodeData) => ({
        ...qrCode,
        qrUrl: `${window.location.origin}/${qrCode.id}`, // QR 코드의 URL 설정
      }));
      setQrCodes(qrCodesWithUrl);
    }
  };

  const handleEdit = (qrCode: QRCodeData) => {
    setSelectedQR(qrCode);
    setNewName(qrCode.name);
    setNewUrl(qrCode.original_id);
  };

  const handleSaveChanges = async () => {
    if (!selectedQR) return;

    const { error } = await supabase
      .from("qr_codes")
      .update({ name: newName, original_id: newUrl })
      .eq("id", selectedQR.id);

    if (error) {
      console.error("Error updating QR code:", error.message);
    } else {
      alert("QR 코드가 수정되었습니다.");
      fetchQRCodes(); // 업데이트 후 목록 새로고침
      setSelectedQR(null); // 선택된 QR 코드 초기화
    }
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
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-4">내 QR 코드</h1>
      {qrCodes.length === 0 ? (
        <p>생성된 QR 코드가 없습니다.</p>
      ) : (
        <ul>
          {qrCodes.map((qrCode) => (
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
