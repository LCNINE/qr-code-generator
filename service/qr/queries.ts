import { Database } from "@/type/supabaseType";
import QRService, { InsertQRProb, UpdateQRProb } from "./services";
import { SupabaseClient } from "@supabase/supabase-js";

export const qrKeys = {
  qrCodes: () => ["qrCodes"] as const,
  mutations: {
    insert: ["qr", "insert"] as const,
    update: ["qr", "update"] as const,
    delete: ["qr", "delete"] as const,
  },
};

export const qrQueryOptions = (supabase: SupabaseClient<Database>) => {
  return {
    qrCodes: () => ({
      queryKey: qrKeys.qrCodes(),
      queryFn: async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        return new QRService(supabase).fetchQR(authData.user.id)
      }, // 인스턴스를 생성하여 메서드 호출
    }),
  };
};

export const qrMutationOptions = (supabase: SupabaseClient<Database>) => {
  return {
    insertQR: () => ({
      mutationKey: qrKeys.mutations.insert,
      mutationFn: async (insertData: InsertQRProb) => {
        return await new QRService(supabase).insertQR(insertData);
      },
    }),
    updateQR: () => ({
      mutationKey: qrKeys.mutations.update,
      mutationFn: async (updateData: UpdateQRProb) => {
        return await new QRService(supabase).updateQR(updateData);
      },
    }),
    deleteQR: () => ({
      mutationKey: qrKeys.mutations.delete,
      mutationFn: async (selectedQRId: string) => {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        return await new QRService(supabase).deleteQR(authData.user.id, selectedQRId);
      },
    }),
  };
};
