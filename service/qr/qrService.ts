import { User } from "@supabase/supabase-js";
import Service from "../service";

type InsertQRProb = {
  id: string;
  qrName: string;
  original_id: string;
  user_id: string;
};

type UpdateQRProb = {
  newName: string;
  newUrl: string;
  selectedQRId: string;
};

interface QRCodeData {
  id: string;
  name: string;
  original_id: string;
  user_id: string | null;
  qrUrl?: string;
}

class QRService extends Service {
  async insertQR(insertData: InsertQRProb) {
    const supabase = await this.supabase;
    const { data, error } = await supabase.from("qr_codes").insert([
      {
        id: insertData.id,
        name: insertData.qrName,
        original_id: insertData.original_id,
        user_id: insertData.user_id,
      },
    ]);

    if (!error) {
      console.log(data);
      const qrUrl = `${window.location.origin}/${insertData.id}`;
      alert("QR 코드가 저장되었습니다.");
      return qrUrl;
    } else {
      console.error(error);
      return null;
    }
  }

  async fetchQR(user: User) {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching QR codes:", error.message);
      return null;
    } else {
      const qrCodesWithUrl = data.map((qrCode: QRCodeData) => ({
        ...qrCode,
        qrUrl: `${window.location.origin}/${qrCode.id}`,
      }));
      return qrCodesWithUrl;
    }
  }

  async updateQR(updateData: UpdateQRProb) {
    const supabase = await this.supabase;
    const { error } = await supabase
      .from("qr_codes")
      .update({ name: updateData.newName, original_id: updateData.newUrl })
      .eq("id", updateData.selectedQRId);

    if (error) {
      console.error("Error updating QR code:", error.message);
      return error;
    } else {
      return null;
    }
  }
}

export default QRService;
