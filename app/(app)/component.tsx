"use client";

import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import QRService from "@/service/qr/qrService";
import QRCodeStyling from "qr-code-styling";
import { Tables } from "@/type/supabaseType";

// Zod 스키마 정의
const qrInputSchema = z.object({
  qrName: z
    .string()
    .min(1, "QR 코드 이름을 입력하세요.")
    .max(30, "QR 코드 이름은 최대 30자까지 가능합니다."),
  url: z.string().min(1, "URL을 입력하세요.").url("유효한 URL을 입력하세요."),
});

interface GenerateQRProps {
  user: Tables<"members"> | null;
}

export default function GenerateQR({ user }: GenerateQRProps) {
  const qrService = new QRService();

  const [qrName, setQrName] = useState<string>(""); // 사용자 입력 QR 이름
  const [url, setUrl] = useState<string>(""); // 사용자 입력 URL
  const [qrData, setQrData] = useState<string | null>(null); // QR에 사용할 경로
  const [error, setError] = useState<string | null>(null); // 오류 메시지 상태
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // QRCodeStyling 인스턴스 생성
  const qrCode = useRef(
    new QRCodeStyling({
      width: 300,
      height: 300,
      data: "",
      dotsOptions: {
        color: "#000000",
        type: "square",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      qrOptions: {
        errorCorrectionLevel: "L",
      },
    })
  ).current;

  useEffect(() => {
    if (qrCodeRef.current && qrData) {
      qrCode.update({ data: qrData });
      qrCode.append(qrCodeRef.current);
    }
  }, [qrData]);

  const handleGenerateQR = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    // 입력값 검사
    const validation = qrInputSchema.safeParse({ qrName, url });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    setError(null);

    // URL로 가는 QR 코드 생성
    setQrData(url);
  };

  const handleSaveToDB = async () => {
    if (!qrData || !user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const id = nanoid(6); // 6글자의 고유한 ID 생성

    try {
      const qrUrl = await qrService.insertQR({
        id,
        qrName,
        original_id: url,
        user_id: user.id,
      });
      if (qrUrl) {
        setQrData(qrUrl); // QR 코드가 가리킬 경로
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQRCode = () => {
    qrCode.download({ name: "qr-code", extension: "png" });
  };

  return (
    <div className="h-full">
      <div className="w-full flex">
        <form className="w-full mt-16 mx-10" onSubmit={handleGenerateQR}>
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
              type="submit"
              className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              QR 생성
            </Button>
          </div>
        </form>
        {qrData && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-center my-4">미리보기</h2>
            <div ref={qrCodeRef} className="mr-4"></div>
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
