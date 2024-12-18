"use client";

import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Tables } from "@/type/supabaseType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qrKeys, qrMutationOptions } from "@/service/qr/queries";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";

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
  const [qrName, setQrName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [qrData, setQrData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const supabase = createClient();

  // QRCodeStyling을 클라이언트 사이드에서만 초기화
  useEffect(() => {
    const initQRCode = async () => {
      if (typeof window !== "undefined") {
        const QRCodeStyling = (await import("qr-code-styling")).default;
        const qrInstance = new QRCodeStyling({
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
        });
        setQrCode(qrInstance);
      }
    };
    initQRCode();
  }, []);

  // QR 코드 데이터가 변경될 때 업데이트
  useEffect(() => {
    if (qrCodeRef.current && qrData && qrCode) {
      qrCodeRef.current.innerHTML = ""; // 이전 QR 코드 제거
      qrCode.update({ data: qrData });
      qrCode.append(qrCodeRef.current);
    }
  }, [qrData, qrCode]);

  const insertQrMutation = useMutation({
    ...qrMutationOptions(supabase).insertQR(),
    onSuccess: (qrUrl) => {
      toast.success("QR코드가 생성되었습니다.");
      setQrData(qrUrl);
    },
    onError: (error) => {
      console.error("QR코드 생성 중 오류 발생:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: qrKeys.qrCodes(),
      });
    },
  });

  const handleGenerateQR = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 입력값 유효성 검사
    const validation = qrInputSchema.safeParse({ qrName, url });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    setError(null);
    setQrData(url);
  };

  const handleSaveToDB = async () => {
    if (!qrData || !user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const id = nanoid(6); // 6자리 고유 ID 생성

    try {
      insertQrMutation.mutate({
        id,
        qrName,
        original_id: url,
        user_id: user.id,
      });
    } catch (err) {
      console.error("저장 중 오류 발생:", err);
    }
  };

  const downloadQRCode = () => {
    if (qrCode) {
      qrCode.download({ name: "qr-code", extension: "png" });
    }
  };

  return (
    <div className="h-full">
      <div className="w-full flex sm:flex-row flex-col p-4" >
        <form className="w-full sm:mt-16 sm:mx-10" onSubmit={handleGenerateQR}>
          <Input
            type="text"
            value={qrName}
            onChange={(e) => setQrName(e.target.value)}
            placeholder="QR코드 이름을 입력하세요."
            className="mb-4 w-full border border-gray-300 rounded p-2"
          />
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="연결 할 링크 입력하세요."
            className="mb-4 w-full border border-gray-300 rounded p-2"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-slate-700 text-white py-2 rounded hover:bg-slate-500"
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
