"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import QRCode from "react-qr-code";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Header from "./customLayOut/Header";
import { useAuth } from "./customLayOut/AuthContext";

// Zod 스키마 정의
const qrInputSchema = z.object({
  qrName: z
    .string()
    .min(1, "QR 코드 이름을 입력하세요.")
    .max(250, "QR 코드 이름은 최대 250자까지 가능합니다."),
  url: z.string().min(1, "URL을 입력하세요.").url("유효한 URL을 입력하세요."),
});

export default function Home() {
  const [qrName, setQrName] = useState<string>(""); // 사용자 입력 URL
  const [url, setUrl] = useState<string>(""); // 사용자 입력 URL
  const [qrData, setQrData] = useState<string | null>(null); // QR에 사용할 경로
  const [error, setError] = useState<string | null>(null); // 오류 메시지 상태
  const { user } = useAuth();

  const handleGenerateQR = () => {
    // 입력값 검사
    const validation = qrInputSchema.safeParse({ qrName, url });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    setError(null);

    // URL로 가는 단순 QR 코드 생성
    setQrData(url);
  };

  const handleSaveToDB = async () => {
    if (!qrData || !user) {
      alert("로그인이 필요합니다.");
      return
    };
  
    const id = nanoid(6); // 6글자의 고유한 ID 생성
    const name = qrName; // QR 코드의 이름
    const original_id = url; // 입력된 URL을 original_id에 저장
  
    // 데이터베이스에 ID, name, original_id, user_id 저장
    const { data, error } = await supabase
      .from("qr_codes")
      .insert([{ id, name, original_id, user_id: user.id }]);
  
    if (!error) {
      console.log(data);
      // 생성된 ID를 포함한 경로를 QR 코드 데이터로 설정
      const qrUrl = `${window.location.origin}/${id}`;
      setQrData(qrUrl); // QR 코드가 가리킬 경로
      alert("QR 코드가 저장되었습니다.");
    } else {
      console.error(error);
    }
  };
  

  const downloadQRCode = () => {
    const svg = document.querySelector("svg");
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
        a.download = "qr-code.png";
        a.click();
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  return (
    <div className="h-full">
      <Header />

      <div className="w-full flex">
        <div className="w-full mt-16 mx-10">
          <Input
            type="text"
            value={qrName}
            onChange={(e) => setQrName(e.target.value)}
            placeholder="Name your QR code (Maximum number of characters: 250)"
            className="mb-4 w-full border border-gray-300 rounded p-2"
          />
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Put your link here"
            className="mb-4 w-full border border-gray-300 rounded p-2"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end">
            <Button
              onClick={handleGenerateQR}
              className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              QR 생성
            </Button>
          </div>
        </div>
        {qrData && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-center my-4">미리보기</h2>
            <QRCode value={qrData} className="mr-4" />
            <div className="flex space-x-4 mt-4">
              <Button
                onClick={handleSaveToDB}
                className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                저장
              </Button>
              <Button
                onClick={downloadQRCode}
                className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
              >
                DOWNLOAD
              </Button>
            </div>
            <p className="text-gray-500">저장 전에는 정적QR입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
