"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createItem, updateItem, deleteItem } from "@/lib/actions";
import { toast } from "sonner";

type Item = {
    id: string;
    jenisBarang: string;
    merkTipe: string;
    nomorAsset: string;
    qty: number;
    status: string;
    loans: { namaPeminjam: string; department: string }[];
};

export function InventoryClient({ initialItems }: { initialItems: Item[] }) {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [form, setForm] = useState({
        jenisBarang: "",
        merkTipe: "",
        nomorAsset: "",
        qty: 1,
    });

    const filteredItems = items.filter(
        (item) =>
            item.jenisBarang.toLowerCase().includes(search.toLowerCase()) ||
            item.merkTipe.toLowerCase().includes(search.toLowerCase()) ||
            item.nomorAsset.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when search or page size changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: string | null) => {
        if (value) {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1);
        }
    };

    const handleOpenDialog = (item?: Item) => {
        if (item) {
            setEditItem(item);
            setForm({
                jenisBarang: item.jenisBarang,
                merkTipe: item.merkTipe,
                nomorAsset: item.nomorAsset,
                qty: item.qty,
            });
        } else {
            setEditItem(null);
            setForm({ jenisBarang: "", merkTipe: "", nomorAsset: "", qty: 1 });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.jenisBarang || !form.nomorAsset) {
            toast.error("Jenis Barang dan Nomor Asset wajib diisi!");
            return;
        }

        try {
            if (editItem) {
                await updateItem(editItem.id, form);
                setItems((prev) =>
                    prev.map((i) => (i.id === editItem.id ? { ...i, ...form } : i))
                );
                toast.success("Barang berhasil diperbarui");
            } else {
                await createItem(form);
                toast.success("Barang berhasil ditambahkan");
                // Refresh page to get new data
                window.location.reload();
            }
            setDialogOpen(false);
        } catch {
            toast.error("Terjadi kesalahan. Pastikan Nomor Asset tidak duplikat.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
            toast.success("Barang berhasil dihapus");
        } catch {
            toast.error("Gagal menghapus barang");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Inventaris Barang
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola daftar barang inventaris IT
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                            />
                        }
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Barang
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editItem ? "Edit Barang" : "Tambah Barang Baru"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="jenisBarang">
                                    Jenis Barang <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="jenisBarang"
                                    placeholder="contoh: Terminal, Laptop, Monitor"
                                    value={form.jenisBarang}
                                    onChange={(e) =>
                                        setForm({ ...form, jenisBarang: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="merkTipe">Merk/Tipe</Label>
                                <Input
                                    id="merkTipe"
                                    placeholder="contoh: HP EliteBook 840"
                                    value={form.merkTipe}
                                    onChange={(e) =>
                                        setForm({ ...form, merkTipe: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomorAsset">
                                    Nomor Asset <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nomorAsset"
                                    placeholder="contoh: IT-2024-001"
                                    value={form.nomorAsset}
                                    onChange={(e) =>
                                        setForm({ ...form, nomorAsset: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qty">Quantity</Label>
                                <Input
                                    id="qty"
                                    type="number"
                                    min={1}
                                    value={form.qty}
                                    onChange={(e) =>
                                        setForm({ ...form, qty: parseInt(e.target.value) || 1 })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" />}>
                                Batal
                            </DialogClose>
                            <Button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {editItem ? "Simpan" : "Tambahkan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="border border-border shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari barang berdasarkan jenis, merk, atau nomor asset..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Items Table */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="border-b bg-muted/50 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Daftar Barang ({filteredItems.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Package className="h-12 w-12 mb-3 text-muted" />
                            <p className="text-sm font-medium">Belum ada barang</p>
                            <p className="text-xs mt-1">
                                Klik tombol &quot;Tambah Barang&quot; untuk menambahkan
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="text-left px-6 py-3 font-medium">No</th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Jenis Barang
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Merk/Tipe
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Nomor Asset
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">QTY</th>
                                        <th className="text-left px-6 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="text-left px-6 py-3 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {paginatedItems.map((item, idx) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {startIndex + idx + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {item.jenisBarang}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {item.merkTipe || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                                    {item.nomorAsset}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{item.qty}</td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={cn(
                                                        item.status === "tersedia"
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
                                                            : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
                                                    )}
                                                >
                                                    {item.status === "tersedia"
                                                        ? "Tersedia"
                                                        : "Dipinjam"}
                                                </Badge>
                                                {item.loans.length > 0 && (
                                                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                                        oleh {item.loans[0].namaPeminjam}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                                                        onClick={() => handleOpenDialog(item)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            render={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-muted"
                                                                />
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Hapus Barang?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Barang &quot;{item.jenisBarang}&quot; ({item.nomorAsset})
                                                                    akan dihapus beserta semua riwayat
                                                                    peminjamannya. Tindakan ini tidak dapat
                                                                    dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
                {totalPages > 1 || filteredItems.length > 5 ? (
                    <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan {startIndex + 1} sampai{" "}
                                {Math.min(startIndex + itemsPerPage, filteredItems.length)} dari{" "}
                                {filteredItems.length} barang
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
