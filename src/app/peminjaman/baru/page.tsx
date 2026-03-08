import { getAvailableItems } from "@/lib/actions";
import { LoanFormClient } from "./loan-form-client";

export default async function NewLoanPage() {
    const items = await getAvailableItems();
    return <LoanFormClient items={items} />;
}
