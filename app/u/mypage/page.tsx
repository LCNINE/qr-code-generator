import { qrQueryOptions } from "@/service/qr/queries";
import ModifyQR from "./component";
import { getDehydratedQuery, Hydrate } from "@/utils/react-query";
import { requireAuth } from "@/utils/supabase/auth";

export default async function MyPage() {
  const { user } = await requireAuth()
  const memberId = user.id
    // transactionQueryOptions에 startDate와 endDate 전달
    const { queryKey, queryFn } = qrQueryOptions.qrCodes(memberId)

    const query = await getDehydratedQuery({
      queryKey,
      queryFn: async () => {
        const data = await queryFn()
        return {
          data
        }
      }
    })

  return (
    <Hydrate state={{ queries: [query] }}>
      <ModifyQR memberId={memberId}/>
    </Hydrate>
  );
}
