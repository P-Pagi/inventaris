"use client";

import { useState } from "react";
import { Plus, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LoanFormClient } from "@/app/peminjaman/baru/loan-form-client";
import { useRouter } from "next/navigation";

type AvailableItem = {
    id: string;
    jenisBarang: string;
    merkTipe: string;
    nomorAsset: string;
    qty: number;
};

export function DashboardActions({ availableItems }: { availableItems: AvailableItem[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={() => router.push("/inventaris")}
            >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Barang
            </Button>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger
                    render={
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none"
                        >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Buat Peminjaman
                        </Button>
                    }
                />

                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Form Peminjaman Baru</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <LoanFormClient
                            items={availableItems}
                            isModal={true}
                            onSuccess={() => {
                                setIsAddModalOpen(false);
                                router.refresh();
                            }}
                            onCancel={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
