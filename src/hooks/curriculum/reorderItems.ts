import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ReorderPayload } from "@/types/curriculum";

type TableName = "years" | "modules" | "subjects" | "lectures";

export async function reorderItems(table: TableName, items: ReorderPayload[]): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      const { error } = await supabaseAdmin.from(table).update({ order_index: item.order_index }).eq("id", item.id);
      if (error) throw new Error(error.message);
    })
  );
}

export function normalizePricePayload(payload: {
  name: string;
  is_free: boolean;
  price_cents: number;
}) {
  return {
    name: payload.name,
    is_free: payload.is_free,
    price_cents: payload.is_free ? 0 : payload.price_cents,
  };
}
