import { qrQueryOptions } from "@/service/qr/queries";
import ModifyQR from "./component";
import { getDehydratedQuery, Hydrate } from "@/utils/react-query";
import { createClient } from "@/utils/supabase/server";

export default async function MyPage() {

  const supabase = createClient()
  
  const { queryKey, queryFn } = qrQueryOptions(supabase).qrCodes();

  const query = await getDehydratedQuery({ queryKey, queryFn })

  return (
    <Hydrate state={{ queries: [query] }}>
      <ModifyQR/>
    </Hydrate>
  );
}
