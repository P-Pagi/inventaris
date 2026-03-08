"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    ClipboardList,
    Plus,
    Search,
    RotateCcw,
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { returnLoan } from "@/lib/actions";
import { toast } from "sonner";
import { LoanFormClient } from "./baru/loan-form-client";

type Loan = {
    id: string;
    yangMeminjamkan: string;
    namaPeminjam: string;
    department: string;
    tglPinjam: string | Date;
    targetTglKembali: string | Date;
    realTglKembali: string | Date | null;
    namaPengembalian: string | null;
    status: string;
    item: {
        jenisBarang: string;
        merkTipe: string;
        nomorAsset: string;
    };
};

type AvailableItem = {
    id: string;
    jenisBarang: string;
    merkTipe: string;
    nomorAsset: string;
    qty: number;
};

export function LoansClient({
    initialLoans,
    availableItems
}: {
    initialLoans: Loan[];
    availableItems: AvailableItem[];
}) {
    const router = useRouter();
    const [loans, setLoans] = useState<Loan[]>(initialLoans);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("semua");
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [returnDate, setReturnDate] = useState<Date | undefined>(new Date());
    const [returnName, setReturnName] = useState("");

    // Sync state when initialLoans changes (after revalidatePath)
    useEffect(() => {
        setLoans(initialLoans);
    }, [initialLoans]);

    const filteredLoans = loans.filter((loan) => {
        const matchSearch =
            loan.namaPeminjam.toLowerCase().includes(search.toLowerCase()) ||
            loan.yangMeminjamkan.toLowerCase().includes(search.toLowerCase()) ||
            loan.department.toLowerCase().includes(search.toLowerCase()) ||
            loan.item.jenisBarang.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
            statusFilter === "semua" || loan.status === statusFilter;

        return matchSearch && matchStatus;
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLoans = filteredLoans.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when search or filter changes
    const handleFilterChange = (setter: (val: string) => void, value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: string | null) => {
        if (value) {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1);
        }
    };

    const handleReturn = async () => {
        if (!selectedLoan || !returnDate || !returnName) {
            toast.error("Tanggal kembali dan nama wajib diisi!");
            return;
        }

        try {
            await returnLoan(selectedLoan.id, {
                realTglKembali: returnDate,
                namaPengembalian: returnName,
            });
            setLoans((prev) =>
                prev.map((l) =>
                    l.id === selectedLoan.id
                        ? {
                            ...l,
                            status: "dikembalikan",
                            realTglKembali: returnDate.toISOString(),
                            namaPengembalian: returnName,
                        }
                        : l
                )
            );
            setReturnDialogOpen(false);
            setReturnName("");
            toast.success("Barang berhasil dikembalikan!");
        } catch {
            toast.error("Gagal mengembalikan barang");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "dipinjam":
                return (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800">
                        Dipinjam
                    </Badge>
                );
            case "dikembalikan":
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800">
                        Dikembalikan
                    </Badge>
                );
            case "overdue":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800">
                        Overdue
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Daftar Peminjaman
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola peminjaman dan pengembalian inventaris IT
                    </p>
                </div>
                <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Peminjaman Baru
                </Button>
            </div>

            {/* Filters */}
            <Card className="border border-border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan nama, departemen, barang..."
                                value={search}
                                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val) => handleFilterChange(setStatusFilter, val ?? "semua")}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Loans Table */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="border-b bg-muted/50 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-primary" />
                        Peminjaman ({filteredLoans.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredLoans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ClipboardList className="h-12 w-12 mb-3 text-muted" />
                            <p className="text-sm font-medium">Tidak ada data peminjaman</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="text-left px-6 py-3 font-medium">Barang</th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Peminjam
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">Dept</th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Tgl Pinjam
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Target Kembali
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">Status</th>
                                        <th className="text-left px-6 py-3 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {paginatedLoans.map((loan) => (
                                        <tr
                                            key={loan.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {loan.item.jenisBarang}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {loan.item.nomorAsset}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-foreground font-medium">{loan.namaPeminjam}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        oleh {loan.yangMeminjamkan}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {loan.department}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {format(new Date(loan.tglPinjam), "dd MMM yyyy", {
                                                    locale: localeId,
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {format(
                                                    new Date(loan.targetTglKembali),
                                                    "dd MMM yyyy",
                                                    { locale: localeId }
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(loan.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(loan.status === "dipinjam" ||
                                                    loan.status === "overdue") && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setReturnDialogOpen(true);
                                                            }}
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                                            Kembalikan
                                                        </Button>
                                                    )}
                                                {loan.status === "dikembalikan" &&
                                                    loan.realTglKembali && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(
                                                                new Date(loan.realTglKembali),
                                                                "dd MMM yyyy",
                                                                { locale: localeId }
                                                            )}
                                                        </span>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
                {totalPages > 1 || filteredLoans.length > 5 ? (
                    <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan {startIndex + 1} sampai{" "}
                                {Math.min(startIndex + itemsPerPage, filteredLoans.length)} dari{" "}
                                {filteredLoans.length} data
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">Tampilkan:</p>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={handlePageSizeChange}
                                >
                                    <SelectTrigger className="h-8 w-[70px] text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="h-8 px-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Sebelumnya
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            "h-8 w-8 p-0 text-xs",
                                            currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""
                                        )}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="h-8 px-2"
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Card>

            {/* Return Dialog */}
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pengembalian Barang</DialogTitle>
                    </DialogHeader>
                    {selectedLoan && (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted rounded-lg p-4 space-y-2">
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Barang:</span>{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedLoan.item.jenisBarang}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Peminjam:</span>{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedLoan.namaPeminjam}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Departemen:</span>{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedLoan.department}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Tanggal Kembali <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !returnDate && "text-muted-foreground"
                                                )}
                                            />
                                        }
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {returnDate
                                            ? format(returnDate, "dd MMMM yyyy", {
                                                locale: localeId,
                                            })
                                            : "Pilih tanggal"}
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={returnDate}
                                            onSelect={setReturnDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="returnName">
                                    Nama Yang Mengembalikan{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="returnName"
                                    placeholder="Nama yang mengembalikan"
                                    value={returnName}
                                    onChange={(e) => setReturnName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Batal
                        </DialogClose>
                        <Button
                            onClick={handleReturn}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Konfirmasi Pengembalian
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Loan Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Form Peminjaman Baru</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <LoanFormClient
                            items={availableItems}
                            isModal={true}
                            onSuccess={() => {
                                setAddDialogOpen(false);
                                router.refresh();
                            }}
                            onCancel={() => setAddDialogOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
