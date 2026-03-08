import { getItems } from "@/lib/actions";
import { InventoryClient } from "./inventory-client";

export default async function InventarisPage() {
    const items = await getItems();
    return <InventoryClient initialItems={items} />;
}
