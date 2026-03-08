"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { History, Search, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { format, getYear } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";

type LoanHistory = {
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
        qty: number;
    };
};

export function HistoryClient({ initialData }: { initialData: LoanHistory[] }) {
    const [data] = useState<LoanHistory[]>(initialData);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("semua");
    const [deptFilter, setDeptFilter] = useState("semua");
    const currentYear = new Date().getFullYear().toString();
    const [yearFilter, setYearFilter] = useState(currentYear);

    // Get unique departments and years
    const departments = [...new Set(data.map((d) => d.department))].sort();
    const years = [...new Set([...data.map((d) => getYear(new Date(d.tglPinjam)).toString()), currentYear])].sort((a, b) => b.localeCompare(a));

    const filteredData = data.filter((loan) => {
        const date = new Date(loan.tglPinjam);
        const matchSearch =
            loan.namaPeminjam.toLowerCase().includes(search.toLowerCase()) ||
            loan.yangMeminjamkan.toLowerCase().includes(search.toLowerCase()) ||
            loan.item.jenisBarang.toLowerCase().includes(search.toLowerCase()) ||
            loan.item.nomorAsset.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
            statusFilter === "semua" || loan.status === statusFilter;

        const matchDept = deptFilter === "semua" || loan.department === deptFilter;

        const matchYear = yearFilter === "semua" || date.getFullYear().toString() === yearFilter;

        return matchSearch && matchStatus && matchDept && matchYear;
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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

    const handleExport = () => {
        try {
            // Define header rows
            const companyTitle = [["PT PENERBIT BUKU ERLANGGA MAHAMERU"]];
            const formTitle = [["FORM PEMINJAMAN INVENTARIS IT"]];
            const emptyRow = [[]];

            // Header Grouping
            const headerGroup = [
                ["NO", "JENIS BARANG", "MERK/TIPE", "NOMOR ASSET", "QTY", "PEMINJAMAN", "", "", "", "PENGEMBALIAN", "", ""]
            ];

            // Sub Headers
            const subHeaders = [
                ["", "", "", "", "", "YANG MEMINJAMKAN", "NAMA PEMINJAM", "DEPT", "TGL PINJAM", "TARGET TGL KEMBALI", "REAL TGL KEMBALI", "NAMA"]
            ];

            // Prepare Data Rows
            const dataRows = filteredData.map((loan, idx) => [
                idx + 1,
                loan.item.jenisBarang,
                loan.item.merkTipe || "-",
                loan.item.nomorAsset,
                loan.item.qty,
                loan.yangMeminjamkan,
                loan.namaPeminjam,
                loan.department,
                format(new Date(loan.tglPinjam), "dd/MM/yyyy"),
                format(new Date(loan.targetTglKembali), "dd/MM/yyyy"),
                loan.realTglKembali ? format(new Date(loan.realTglKembali), "dd/MM/yyyy") : "-",
                loan.namaPengembalian || "-",
            ]);

            // Combine all rows
            const allRows = [
                ...companyTitle,
                ...formTitle,
                ...emptyRow,
                ...headerGroup,
                ...subHeaders,
                ...dataRows
            ];

            const ws = XLSX.utils.aoa_to_sheet(allRows);

            // Merge Cells
            // !merges format: { s: { r: row_start, c: col_start }, e: { r: row_end, c: col_end } }
            // Rows are 0-indexed
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Company Title
                { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }, // Form Title
                { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // NO (vertical merge)
                { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // JENIS BARANG
                { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // MERK/TIPE
                { s: { r: 3, c: 3 }, e: { r: 4, c: 3 } }, // NOMOR ASSET
                { s: { r: 3, c: 4 }, e: { r: 4, c: 4 } }, // QTY
                { s: { r: 3, c: 5 }, e: { r: 3, c: 8 } }, // PEMINJAMAN (horizontal merge)
                { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } }, // PENGEMBALIAN (horizontal merge)
            ];

            // Apply Basic Styling (Centering titles)
            // Note: Basic XLSX library has limited styling support withoutxlsx-js-style, 
            // but we can set column widths.
            const colWidths = [
                { wch: 5 },  // NO
                { wch: 20 }, // JENIS BARANG
                { wch: 20 }, // MERK/TIPE
                { wch: 15 }, // NOMOR ASSET
                { wch: 6 },  // QTY
                { wch: 20 }, // YANG MEMINJAMKAN
                { wch: 20 }, // NAMA PEMINJAM
                { wch: 15 }, // DEPT
                { wch: 12 }, // TGL PINJAM
                { wch: 12 }, // TARGET TGL KEMBALI
                { wch: 12 }, // REAL TGL KEMBALI
                { wch: 20 }, // NAMA
            ];
            ws["!cols"] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Laporan Peminjaman");

            const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([buf], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const yearSuffix = yearFilter !== "semua" ? `_Tahun_${yearFilter}` : "";
            const fileName = `Form_Peminjaman_IT${yearSuffix}_${format(new Date(), "yyyyMMdd")}.xlsx`;

            saveAs(blob, fileName);
            toast.success(`Data ${filteredData.length} baris berhasil diunduh!`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Gagal mengexport data");
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
                        Riwayat & Laporan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Riwayat lengkap peminjaman dan pengembalian inventaris IT
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={yearFilter} onValueChange={(val) => handleFilterChange(setYearFilter, val ?? "semua")}>
                        <SelectTrigger className="w-full sm:w-[130px] border-emerald-200">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Tahun</SelectItem>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleExport}
                        disabled={filteredData.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border border-border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan nama, barang, nomor asset..."
                                value={search}
                                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val) => handleFilterChange(setStatusFilter, val ?? "semua")}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={deptFilter} onValueChange={(val) => handleFilterChange(setDeptFilter, val ?? "semua")}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Dept" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Dept</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* History Table */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="border-b bg-muted/50 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        Riwayat Peminjaman ({filteredData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <FileSpreadsheet className="h-12 w-12 mb-3 text-muted" />
                            <p className="text-sm font-medium">Tidak ada data riwayat</p>
                            <p className="text-xs mt-1">
                                Data akan muncul setelah ada peminjaman
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="text-left px-4 py-3 font-medium">No</th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Jenis Barang
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Merk/Tipe
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            No. Asset
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Meminjamkan
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Peminjam
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">Dept</th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Tgl Pinjam
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Target
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Real Kembali
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Pengembalian
                                        </th>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {paginatedData.map((loan, idx) => (
                                        <tr
                                            key={loan.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {startIndex + idx + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {loan.item.jenisBarang}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {loan.item.merkTipe || "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                                                    {loan.item.nomorAsset}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {loan.yangMeminjamkan}
                                            </td>
                                            <td className="px-4 py-3 text-foreground">
                                                {loan.namaPeminjam}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {loan.department}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {format(new Date(loan.tglPinjam), "dd/MM/yy", {
                                                    locale: localeId,
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {format(
                                                    new Date(loan.targetTglKembali),
                                                    "dd/MM/yy",
                                                    { locale: localeId }
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {loan.realTglKembali
                                                    ? format(new Date(loan.realTglKembali), "dd/MM/yy", {
                                                        locale: localeId,
                                                    })
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {loan.namaPengembalian || "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(loan.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
                {totalPages > 1 || filteredData.length > 5 ? (
                    <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan {startIndex + 1} sampai{" "}
                                {Math.min(startIndex + itemsPerPage, filteredData.length)} dari{" "}
                                {filteredData.length} data
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
        </div>
    );
}
