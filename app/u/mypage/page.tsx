"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/customLayOut/AuthContext";

interface QRCodeData {
  id: string;
  name: string;
  original_id: string;
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
      setQrCodes(data);
    }
  };

  const handleEdit = (qrCode: QRCodeData) => {
    setSelectedQR(qrCode);
    setNewName(qrCode.name);
    setNewUrl(qrCode.original_id);
  };

  const handleSaveChanges = async () => {
    if (!selectedQR) return;

    const { data, error } = await supabase
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
              <Button onClick={() => handleEdit(qrCode)} className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                수정
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
