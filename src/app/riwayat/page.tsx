import { getExportData } from "@/lib/actions";
import { HistoryClient } from "./history-client";

export default async function RiwayatPage() {
    const data = await getExportData();
    return <HistoryClient initialData={data} />;
}
