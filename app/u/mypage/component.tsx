"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQrs } from "@/service/qr/useQrs";
import { Spinner } from "@/components/custom/spinner";
import { createClient } from "@/utils/supabase/client";
import { qrKeys, qrMutationOptions } from "@/service/qr/queries";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Types
interface QRCodeData {
  id: string;
  name: string;
  original_id: string;
  qrUrl: string;
}

interface QRCardProps {
  qrCode: QRCodeData;
  isEditing: boolean;
  newName: string;
  newUrl: string;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

// Components
const EditableField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) => (
  <div>
    <p>{label}:</p>
    <Input
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="mb-2 w-full border border-gray-300 rounded p-2"
    />
  </div>
);

const ActionButtons = ({
  isEditing,
  onSave,
  onEdit,
  onDownload,
  onDelete,
}: {
  isEditing: boolean;
  onSave: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) => (
  <div className="flex space-x-2">
    {isEditing ? (
      <Button
        onClick={onSave}
        className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        저장
      </Button>
    ) : (
      <>
        <Button
          onClick={onEdit}
          className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
        >
          수정
        </Button>
        <Button
          onClick={onDownload}
          className="bg-yellow-500 text-white py-1 px-4 rounded hover:bg-yellow-600"
        >
          다운로드
        </Button>
        <Button
          onClick={onDelete}
          className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
        >
          삭제
        </Button>
      </>
    )}
  </div>
);

const QRCard = ({
  qrCode,
  isEditing,
  newName,
  newUrl,
  onNameChange,
  onUrlChange,
  onEdit,
  onSave,
  onDownload,
  onDelete,
}: QRCardProps) => (
  <div className="border-2 rounded-md p-6">
    <div className="flex items-start">
      <QRCode
        id={`qr-code-${qrCode.id}`}
        value={qrCode.qrUrl}
        className="mb-2"
      />
      <div className="ml-4 flex-1">
        <EditableField
          label="이름"
          value={isEditing ? newName : qrCode.name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={!isEditing}
        />
        <EditableField
          label="URL"
          value={isEditing ? newUrl : qrCode.original_id}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={!isEditing}
        />
        <ActionButtons
          isEditing={isEditing}
          onSave={onSave}
          onEdit={onEdit}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      </div>
    </div>
  </div>
);

// Utilities
const downloadQRCode = (qrCode: QRCodeData) => {
  const svg = document.getElementById(`qr-code-${qrCode.id}`);
  if (!svg) return;

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
};

// Main Component
export default function ModifyQR() {
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");

  const supabase = createClient();
  const router = useRouter();

  const { data: qrCodes, isLoading, isError, error: qrError } = useQrs();

  // Auth Error Handling
  if (qrError instanceof AuthError) {
    router.push(`/u/signin?redirect_to=mypage`);
  }

  const queryClient = useQueryClient();
  const qrEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: qrKeys.qrCodes(),
    });
    setSelectedQR(null);
  };

  const updateQRMutation = useMutation({
    ...qrMutationOptions(supabase).updateQR(),
    onSuccess: () => {
      toast.success("qr코드가 수정되었습니다.");
    },
    onError: (error) => {
      console.error("수정 중 오류 발생:", error);
    },
    onSettled: qrEditSuccess,
  });

  const deleteQRMutation = useMutation({
    ...qrMutationOptions(supabase).deleteQR(),
    onSuccess: () => {
      toast.success("qr코드가 삭제되었습니다.");
    },
    onError: (error) => {
      console.error("삭제 중 오류 발생:", error);
    },
    onSettled: qrEditSuccess,
  });

  // Event Handlers
  const handleEdit = (qrCode: QRCodeData) => {
    setSelectedQR(qrCode);
    setNewName(qrCode.name);
    setNewUrl(qrCode.original_id);
  };

  const handleSaveChanges = () => {
    if (!selectedQR) return;
    updateQRMutation.mutate({ newName, newUrl, selectedQRId: selectedQR.id });
  };

  const handleDelete = async (qrCode: QRCodeData) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    deleteQRMutation.mutate(qrCode.id);
  };

  // Loading and Error States
  if (isLoading) return <Spinner />;
  if (isError) return <p>데이터를 불러오는 중 오류가 발생했습니다.</p>;

  // Render
  return (
    <div className="h-full">
      <div className="text-3xl w-full border-2 p-2 bg-blue-500 text-white">
        QR 목록
      </div>
      <div className="grid grid-cols-3 gap-4 justify-around mt-4 p-10">
        {!Array.isArray(qrCodes) ? null : qrCodes.length === 0 ? (
          <p>생성된 QR 코드가 없습니다.</p>
        ) : (
          qrCodes.map((qrCode) => (
            <QRCard
              key={qrCode.id}
              qrCode={qrCode}
              isEditing={selectedQR?.id === qrCode.id}
              newName={newName}
              newUrl={newUrl}
              onNameChange={setNewName}
              onUrlChange={setNewUrl}
              onEdit={() => handleEdit(qrCode)}
              onSave={handleSaveChanges}
              onDownload={() => downloadQRCode(qrCode)}
              onDelete={() => handleDelete(qrCode)}
            />
          ))
        )}
      </div>
    </div>
  );
}
