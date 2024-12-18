import Service from "../service";

export type InsertQRProb = {
  id: string;
  qrName: string;
  original_id: string;
  user_id: string;
};

export type UpdateQRProb = {
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
    const { error } = await this.supabase.from("qr_codes").insert([
      {
        id: insertData.id,
        name: insertData.qrName,
        original_id: insertData.original_id,
        user_id: insertData.user_id,
      },
    ]);

    if (error) {
      throw error;
    } else {
      const qrUrl = `ald.my/${insertData.id}`;
      return qrUrl;
    }
  }

  async fetchQR(user_id: string) {
    const { data, error } = await this.supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      throw error;
    } else {
      const qrCodesWithUrl = data.map((qrCode: QRCodeData) => ({
        ...qrCode,
        qrUrl: `ald.my/${qrCode.id}`,
      }));
      return qrCodesWithUrl;
    }
  }

  async updateQR(updateData: UpdateQRProb) {
    const { error } = await this.supabase
      .from("qr_codes")
      .update({ name: updateData.newName, original_id: updateData.newUrl })
      .eq("id", updateData.selectedQRId);

    if (error) {
      throw error;
    } else {
      return null;
    }
  }

  async deleteQR(userId: string, selectedQRId: string) {
    console.log('userId : ', userId)
    console.log('selectedQRId : ', selectedQRId)
    const { error } = await this.supabase
      .from("qr_codes")
      .delete()
      .eq("id", selectedQRId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting QR code:", error.message);
      throw error;
    } else {
      return null;
    }
  }
}

export default QRService;
