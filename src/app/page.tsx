import { getStatistics, getLoans, getAvailableItems } from "@/lib/actions";
import {
  Package,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DashboardActions } from "./dashboard-actions";

export default async function DashboardPage() {
  const [stats, activeLoans, overdueLoans, availableItems] = await Promise.all([
    getStatistics(),
    getLoans(undefined, "dipinjam"),
    getLoans(undefined, "overdue"),
    getAvailableItems(),
  ]);

  const recentLoans = [...overdueLoans, ...activeLoans].slice(0, 5);

  const statCards = [
    {
      title: "Total Barang",
      value: stats.totalItems,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Sedang Dipinjam",
      value: stats.dipinjam,
      icon: ArrowRightLeft,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Tersedia",
      value: stats.tersedia,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistem Peminjaman Inventaris IT — PT Penerbit Buku Erlangga
            Mahameru
          </p>
        </div>
        <DashboardActions availableItems={availableItems} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={cn(
              "border shadow-sm hover:shadow-md transition-shadow duration-300",
              stat.borderColor,
              "dark:bg-card dark:border-border"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className={cn("text-3xl font-bold mt-2", stat.color)}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bgColor, "dark:bg-muted")}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Loans Table */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="border-b bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Peminjaman Aktif
            </CardTitle>
            <Link href="/peminjaman">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-muted"
              >
                Lihat Semua →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-300" />
              <p className="text-sm font-medium">
                Tidak ada peminjaman aktif
              </p>
              <p className="text-xs mt-1">
                Semua barang dalam kondisi tersedia
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">
                      Barang
                    </th>
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
                    <th className="text-left px-6 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {loan.item.jenisBarang}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.item.nomorAsset}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {loan.namaPeminjam}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {loan.department}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(loan.tglPinjam), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(
                          new Date(loan.targetTglKembali),
                          "dd MMM yyyy",
                          { locale: id }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            loan.status === "overdue"
                              ? "destructive"
                              : "secondary"
                          }
                          className={cn(
                            loan.status === "overdue"
                              ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                              : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
                          )}
                        >
                          {loan.status === "overdue"
                            ? "Overdue"
                            : "Dipinjam"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
