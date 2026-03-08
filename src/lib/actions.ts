"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============== INVENTORY ITEMS ==============

export async function getItems(search?: string, status?: string) {
    const where: Record<string, unknown> = {};

    if (search) {
        where.OR = [
            { jenisBarang: { contains: search } },
            { merkTipe: { contains: search } },
            { nomorAsset: { contains: search } },
        ];
    }

    if (status && status !== "semua") {
        where.status = status;
    }

    return prisma.inventoryItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            loans: {
                where: { status: { in: ["dipinjam", "overdue"] } },
                select: { namaPeminjam: true, department: true, tglPinjam: true },
            },
        },
    });
}

export async function getAvailableItems() {
    return prisma.inventoryItem.findMany({
        where: { status: "tersedia" },
        orderBy: { jenisBarang: "asc" },
    });
}

export async function createItem(data: {
    jenisBarang: string;
    merkTipe: string;
    nomorAsset: string;
    qty: number;
}) {
    await prisma.inventoryItem.create({ data });
    revalidatePath("/inventaris");
    revalidatePath("/");
}

export async function updateItem(
    id: string,
    data: {
        jenisBarang: string;
        merkTipe: string;
        nomorAsset: string;
        qty: number;
    }
) {
    await prisma.inventoryItem.update({ where: { id }, data });
    revalidatePath("/inventaris");
    revalidatePath("/");
}

export async function deleteItem(id: string) {
    await prisma.inventoryItem.delete({ where: { id } });
    revalidatePath("/inventaris");
    revalidatePath("/");
}

// ============== LOANS ==============

export async function getLoans(search?: string, status?: string) {
    const where: Record<string, unknown> = {};

    if (search) {
        where.OR = [
            { namaPeminjam: { contains: search } },
            { yangMeminjamkan: { contains: search } },
            { department: { contains: search } },
            { item: { jenisBarang: { contains: search } } },
        ];
    }

    if (status && status !== "semua") {
        where.status = status;
    }

    // Auto-detect overdue loans
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await prisma.loan.updateMany({
        where: {
            status: "dipinjam",
            targetTglKembali: { lt: startOfToday },
        },
        data: { status: "overdue" },
    });

    // Fix status if a loan was previously marked overdue but is actually today/future
    await prisma.loan.updateMany({
        where: {
            status: "overdue",
            targetTglKembali: { gte: startOfToday },
        },
        data: { status: "dipinjam" },
    });

    return prisma.loan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            item: {
                select: { jenisBarang: true, merkTipe: true, nomorAsset: true },
            },
        },
    });
}

export async function createLoan(data: {
    itemId: string;
    yangMeminjamkan: string;
    namaPeminjam: string;
    department: string;
    tglPinjam: Date;
    targetTglKembali: Date;
}) {
    await prisma.$transaction([
        prisma.loan.create({ data }),
        prisma.inventoryItem.update({
            where: { id: data.itemId },
            data: { status: "dipinjam" },
        }),
    ]);
    revalidatePath("/peminjaman");
    revalidatePath("/inventaris");
    revalidatePath("/");
}

export async function returnLoan(
    loanId: string,
    data: {
        realTglKembali: Date;
        namaPengembalian: string;
    }
) {
    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new Error("Loan not found");

    await prisma.$transaction([
        prisma.loan.update({
            where: { id: loanId },
            data: {
                ...data,
                status: "dikembalikan",
            },
        }),
        prisma.inventoryItem.update({
            where: { id: loan.itemId },
            data: { status: "tersedia" },
        }),
    ]);
    revalidatePath("/peminjaman");
    revalidatePath("/inventaris");
    revalidatePath("/");
}

// ============== STATISTICS ==============

export async function getStatistics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalItems, dipinjam, tersedia, totalLoans, overdue] =
        await Promise.all([
            prisma.inventoryItem.count(),
            prisma.inventoryItem.count({ where: { status: "dipinjam" } }),
            prisma.inventoryItem.count({ where: { status: "tersedia" } }),
            prisma.loan.count(),
            prisma.loan.count({
                where: {
                    status: { in: ["dipinjam", "overdue"] },
                    targetTglKembali: { lt: startOfToday },
                },
            }),
        ]);

    return { totalItems, dipinjam, tersedia, totalLoans, overdue };
}

// ============== EXPORT ==============

export async function getExportData() {
    return prisma.loan.findMany({
        orderBy: { tglPinjam: "desc" },
        include: {
            item: {
                select: { jenisBarang: true, merkTipe: true, nomorAsset: true, qty: true },
            },
        },
    });
}
