"use client";

import { useQuery } from "@tanstack/react-query";
import { qrQueryOptions } from "./queries";
import { createClient } from "@/utils/supabase/client";

export const useQrs = () => {
  const supabase = createClient();
  return useQuery({
    ...qrQueryOptions(supabase).qrCodes(),
  });
};
