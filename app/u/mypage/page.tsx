import { qrQueryOptions } from "@/service/qr/queries";
import ModifyQR from "./component";
import { getDehydratedQuery, Hydrate } from "@/utils/react-query";
import { createClient } from "@/utils/supabase/server";

export default async function MyPage() {

  const supabase = createClient()
  // transactionQueryOptions에 startDate와 endDate 전달
  const { queryKey, queryFn } = qrQueryOptions(supabase).qrCodes();

  const query = await getDehydratedQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      return {
        data,
      };
    },
  });

  return (
    <Hydrate state={{ queries: [query] }}>
      <ModifyQR/>
    </Hydrate>
  );
}
