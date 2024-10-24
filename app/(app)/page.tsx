import { getCurrentUser } from "@/utils/supabase/auth";
import GenerateQR from "./component";
import { Tables } from "@/type/supabaseType";

export default async function Home() {
  const user: Tables<'members'> | null = await getCurrentUser();

  return (
    <GenerateQR user={user}/>
  );
}
