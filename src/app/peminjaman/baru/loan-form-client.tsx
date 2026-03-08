"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createLoan } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

type AvailableItem = {
    id: string;
    jenisBarang: string;
    merkTipe: string;
    nomorAsset: string;
    qty: number;
};

export function LoanFormClient({
    items,
    isModal = false,
    onSuccess,
    onCancel,
}: {
    items: AvailableItem[];
    isModal?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [yangMeminjamkan, setYangMeminjamkan] = useState("");
    const [namaPeminjam, setNamaPeminjam] = useState("");
    const [department, setDepartment] = useState("");
    const [tglPinjam, setTglPinjam] = useState<Date | undefined>(new Date());
    const [targetTglKembali, setTargetTglKembali] = useState<Date | undefined>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !selectedItem ||
            !yangMeminjamkan ||
            !namaPeminjam ||
            !department ||
            !tglPinjam ||
            !targetTglKembali
        ) {
            toast.error("Semua field wajib diisi!");
            return;
        }

        setLoading(true);
        try {
            await createLoan({
                itemId: selectedItem,
                yangMeminjamkan,
                namaPeminjam,
                department,
                tglPinjam,
                targetTglKembali,
            });
            toast.success("Peminjaman berhasil dibuat!");
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/peminjaman");
            }
        } catch {
            toast.error("Gagal membuat peminjaman");
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Select Item */}
            <div className="space-y-2">
                <Label>
                    Pilih Barang <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedItem} onValueChange={(val) => setSelectedItem(val ?? "")}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih barang yang tersedia" />
                    </SelectTrigger>
                    <SelectContent>
                        {items.length === 0 ? (
                            <SelectItem value="none" disabled>
                                Tidak ada barang tersedia
                            </SelectItem>
                        ) : (
                            items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.jenisBarang}
                                    {item.merkTipe ? ` - ${item.merkTipe}` : ""} (
                                    {item.nomorAsset})
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Yang Meminjamkan */}
            <div className="space-y-2">
                <Label htmlFor="yangMeminjamkan">
                    Yang Meminjamkan <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="yangMeminjamkan"
                    placeholder="Nama yang meminjamkan barang"
                    value={yangMeminjamkan}
                    onChange={(e) => setYangMeminjamkan(e.target.value)}
                />
            </div>

            {/* Nama Peminjam */}
            <div className="space-y-2">
                <Label htmlFor="namaPeminjam">
                    Nama Peminjam <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="namaPeminjam"
                    placeholder="Nama peminjam"
                    value={namaPeminjam}
                    onChange={(e) => setNamaPeminjam(e.target.value)}
                />
            </div>

            {/* Department */}
            <div className="space-y-2">
                <Label htmlFor="department">
                    Departemen <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="department"
                    placeholder="contoh: Marketing, IT, HRD"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tgl Pinjam */}
                <div className="space-y-2">
                    <Label>
                        Tanggal Pinjam <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !tglPinjam && "text-muted-foreground"
                                    )}
                                />
                            }
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {tglPinjam
                                ? format(tglPinjam, "dd MMMM yyyy", {
                                    locale: localeId,
                                })
                                : "Pilih tanggal"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={tglPinjam}
                                onSelect={setTglPinjam}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Target Tgl Kembali */}
                <div className="space-y-2">
                    <Label>
                        Target Tgl Kembali <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !targetTglKembali && "text-muted-foreground"
                                    )}
                                />
                            }
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {targetTglKembali
                                ? format(targetTglKembali, "dd MMMM yyyy", {
                                    locale: localeId,
                                })
                                : "Pilih tanggal"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={targetTglKembali}
                                onSelect={setTargetTglKembali}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                {isModal ? (
                    <Button
                        variant="outline"
                        type="button"
                        className="flex-1"
                        onClick={onCancel}
                    >
                        Batal
                    </Button>
                ) : (
                    <Link href="/peminjaman" className="flex-1">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full"
                        >
                            Batal
                        </Button>
                    </Link>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                >
                    {loading ? "Menyimpan..." : "Simpan Peminjaman"}
                </Button>
            </div>
        </form>
    );

    if (isModal) {
        return <div className="p-0">{formContent}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/peminjaman">
                    <Button variant="ghost" size="icon" className="rounded-lg">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Form Peminjaman Baru
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Isi data peminjaman inventaris IT
                    </p>
                </div>
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="border-b bg-gray-50/80 dark:bg-gray-900/50 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                        Data Peminjaman
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {formContent}
                </CardContent>
            </Card>
        </div>
    );
}
