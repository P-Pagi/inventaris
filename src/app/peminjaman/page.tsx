import { getLoans, getAvailableItems } from "@/lib/actions";
import { LoansClient } from "./loans-client";

export default async function PeminjamanPage() {
    const [loans, availableItems] = await Promise.all([
        getLoans(),
        getAvailableItems()
    ]);

    return <LoansClient initialLoans={loans} availableItems={availableItems} />;
}
