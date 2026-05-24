"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BedDouble,
  CalendarDays,
  Download,
  FileBarChart,
  Home,
  Pill,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DischargeRow,
  InpatientRow,
  MedicineRow,
  ReportKey,
  ReportsPayload,
  RevenueRow,
  VisitRow
} from "@/components/reports/types";
import { compactNumber, formatCurrency, formatDate } from "@/lib/utils";

const tabLabels: Record<ReportKey, string> = {
  inpatient: "Nội trú",
  revenue: "Doanh thu",
  visits: "Lượt khám",
  medicines: "Thuốc",
  discharges: "Xuất viện"
};

const tabIcons: Record<ReportKey, React.ReactNode> = {
  inpatient: <BedDouble className="h-4 w-4" />,
  revenue: <WalletCards className="h-4 w-4" />,
  visits: <CalendarDays className="h-4 w-4" />,
  medicines: <Pill className="h-4 w-4" />,
  discharges: <FileBarChart className="h-4 w-4" />
};

function numberValue(value: unknown) {
  return Number(value || 0);
}

function paymentVariant(status: string): "success" | "warning" | "danger" | "secondary" {
  const normalized = status.toLowerCase();
  if (normalized.includes("đã") || normalized.includes("da")) return "success";
  if (normalized.includes("chưa") || normalized.includes("chua")) return "warning";
  if (normalized.includes("quá") || normalized.includes("qua")) return "danger";
  return "secondary";
}

function visibleTabs(payload: ReportsPayload | null): ReportKey[] {
  if (!payload) return ["inpatient", "revenue", "visits", "medicines", "discharges"];
  return (Object.keys(tabLabels) as ReportKey[]).filter((key) => payload.permissions[key]);
}

function downloadJson(payload: ReportsPayload | null) {
  if (!payload) return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bao-cao-thong-ke-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsShell({
  initialPayload,
  initialTab,
  apiBaseUrl
}: {
  initialPayload: ReportsPayload | null;
  initialTab?: string;
  apiBaseUrl: string;
}) {
  const [payload, setPayload] = useState<ReportsPayload | null>(initialPayload);
  const tabs = visibleTabs(payload);
  const firstTab = tabs[0] || "inpatient";
  const [activeTab, setActiveTab] = useState<ReportKey>(
    tabs.includes(initialTab as ReportKey) ? (initialTab as ReportKey) : firstTab
  );
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const kpis = useMemo(() => {
    const inpatientRows = payload?.data.inpatient || [];
    const revenueRows = payload?.data.revenue || [];
    const visitRows = payload?.data.visits || [];
    const medicineRows = payload?.data.medicines || [];
    const dischargeRows = payload?.data.discharges || [];

    const totalPatients = inpatientRows.reduce((sum, row) => sum + numberValue(row.patientCount), 0);
    const totalBeds = inpatientRows.reduce((sum, row) => sum + numberValue(row.totalBeds), 0);
    const occupancy = totalBeds ? Math.round((totalPatients / totalBeds) * 100) : 0;
    const totalRevenue = revenueRows.reduce(
      (sum, row) => sum + numberValue(row.revenue) + numberValue(row.insurance),
      0
    );
    const totalVisits = visitRows.reduce((sum, row) => sum + numberValue(row.visitCount), 0);
    const totalMedicine = medicineRows.reduce((sum, row) => sum + numberValue(row.totalUsed), 0);

    return [
      {
        label: "Bệnh nhân nội trú",
        value: compactNumber(totalPatients),
        detail: `${occupancy}% công suất giường`,
        icon: <BedDouble className="h-5 w-5 text-sky-700" />,
        show: payload?.permissions.inpatient
      },
      {
        label: "Doanh thu tổng hợp",
        value: formatCurrency(totalRevenue),
        detail: `${revenueRows.length} kỳ ghi nhận`,
        icon: <WalletCards className="h-5 w-5 text-emerald-700" />,
        show: payload?.permissions.revenue
      },
      {
        label: "Lượt khám 30 ngày",
        value: compactNumber(totalVisits),
        detail: `${visitRows.length} ngày có dữ liệu`,
        icon: <Activity className="h-5 w-5 text-indigo-700" />,
        show: payload?.permissions.visits
      },
      {
        label: "Thuốc đã sử dụng",
        value: compactNumber(totalMedicine),
        detail: `${medicineRows.length} loại thuốc`,
        icon: <Pill className="h-5 w-5 text-amber-700" />,
        show: payload?.permissions.medicines
      },
      {
        label: "Hồ sơ xuất viện",
        value: compactNumber(dischargeRows.length),
        detail: "Theo trạng thái thanh toán",
        icon: <FileBarChart className="h-5 w-5 text-rose-700" />,
        show: payload?.permissions.discharges
      }
    ].filter((item) => item.show);
  }, [payload]);

  async function refreshReports() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/reports/summary", { cache: "no-store" });
      if (response.ok) {
        setPayload(await response.json());
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  function updateTab(value: string) {
    const nextTab = value as ReportKey;
    setActiveTab(nextTab);
    window.history.replaceState(null, "", `/reports?tab=${nextTab}`);
    setQuery("");
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-background report-grid-bg p-4 sm:p-8">
        <Card className="mx-auto mt-16 max-w-xl">
          <CardHeader>
            <CardTitle>Chưa lấy được dữ liệu báo cáo</CardTitle>
            <CardDescription>
              Đăng nhập ở backend Express rồi mở lại dashboard Next để dùng session hiện tại.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={`${apiBaseUrl}/login`}>Đăng nhập</a>
            </Button>
            <Button variant="outline" onClick={refreshReports} type="button">
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background report-grid-bg">
      <section className="container py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Module 8</Badge>
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {payload.user.roleCode}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Cập nhật {formatDate(payload.generatedAt)}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-normal text-foreground sm:text-4xl">
              Báo cáo - thống kê
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Dashboard tổng hợp bệnh nhân nội trú, doanh thu, lượt khám, thuốc và xuất viện từ dữ liệu HIS.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" type="button" asChild>
              <a href={`${apiBaseUrl}/`}>
                <Home className="h-4 w-4" />
                Trang chủ
              </a>
            </Button>
            <Button variant="outline" type="button" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              In
            </Button>
            <Button variant="outline" type="button" onClick={() => downloadJson(payload)}>
              <Download className="h-4 w-4" />
              JSON
            </Button>
            <Button type="button" onClick={refreshReports} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-md bg-muted p-2">{item.icon}</div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <strong className="mt-1 block text-2xl font-extrabold">{item.value}</strong>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={activeTab} onValueChange={updateTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="gap-2">
                  {tabIcons[tab]}
                  {tabLabels[tab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm trong bảng hiện tại"
            />
          </div>
        </div>

        {activeTab === "inpatient" && <InpatientReport payload={payload} query={query} />}
        {activeTab === "revenue" && <RevenueReport payload={payload} query={query} />}
        {activeTab === "visits" && <VisitsReport payload={payload} query={query} />}
        {activeTab === "medicines" && <MedicinesReport payload={payload} query={query} />}
        {activeTab === "discharges" && <DischargesReport payload={payload} query={query} />}
      </section>
    </main>
  );
}

function InpatientReport({ payload, query }: { payload: ReportsPayload; query: string }) {
  const rows = payload.data.inpatient;
  const filteredRows = rows.filter((row) => row.departmentName.toLowerCase().includes(query.toLowerCase()));
  const chartRows = [...rows].sort((a, b) => numberValue(b.patientCount) - numberValue(a.patientCount));

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <OccupancyPanel rows={chartRows} />
      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo tải giường</CardTitle>
          <CardDescription>Khoa trên 80% cần ưu tiên điều phối.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {chartRows.slice(0, 6).map((row) => {
            const occupancy = numberValue(row.totalBeds)
              ? Math.round((numberValue(row.patientCount) / numberValue(row.totalBeds)) * 100)
              : 0;
            return (
              <div key={row.departmentName}>
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">{row.departmentName}</span>
                  <Badge variant={occupancy > 90 ? "danger" : occupancy > 75 ? "warning" : "success"}>{occupancy}%</Badge>
                </div>
                <Progress
                  value={occupancy}
                  indicatorClassName={occupancy > 90 ? "bg-rose-500" : occupancy > 75 ? "bg-amber-500" : "bg-emerald-500"}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
      <ReportTable>
        <TableHeader>
          <TableRow>
            <TableHead>Khoa</TableHead>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>Tổng giường</TableHead>
            <TableHead>Giường trống</TableHead>
            <TableHead>Công suất</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((row) => {
            const occupancy = numberValue(row.totalBeds)
              ? Math.round((numberValue(row.patientCount) / numberValue(row.totalBeds)) * 100)
              : 0;
            return (
              <TableRow key={row.departmentName}>
                <TableCell className="font-semibold">{row.departmentName}</TableCell>
                <TableCell>{row.patientCount}</TableCell>
                <TableCell>{row.totalBeds}</TableCell>
                <TableCell>{Math.max(numberValue(row.totalBeds) - numberValue(row.patientCount), 0)}</TableCell>
                <TableCell>
                  <div className="flex min-w-36 items-center gap-3">
                    <span className="w-10 text-sm font-semibold">{occupancy}%</span>
                    <Progress value={occupancy} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </ReportTable>
    </div>
  );
}

function RevenueReport({ payload, query }: { payload: ReportsPayload; query: string }) {
  const rows = [...payload.data.revenue].reverse();
  const filteredRows = rows.filter((row) => row.month.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid gap-5">
      <RevenuePanel rows={rows} />
      <ReportTable>
        <TableHeader>
          <TableRow>
            <TableHead>Tháng</TableHead>
            <TableHead>Thực thu</TableHead>
            <TableHead>BHYT hỗ trợ</TableHead>
            <TableHead>Tổng cộng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((row) => (
            <TableRow key={row.month}>
              <TableCell className="font-semibold">{row.month}</TableCell>
              <TableCell className="font-semibold text-sky-700">{formatCurrency(row.revenue)}</TableCell>
              <TableCell className="text-emerald-700">{formatCurrency(row.insurance)}</TableCell>
              <TableCell className="font-bold">{formatCurrency(numberValue(row.revenue) + numberValue(row.insurance))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ReportTable>
    </div>
  );
}

function VisitsReport({ payload, query }: { payload: ReportsPayload; query: string }) {
  const rows = [...payload.data.visits].reverse();
  const filteredRows = rows.filter((row) => formatDate(row.date).includes(query) || String(row.visitCount).includes(query));

  return (
    <div className="grid gap-5">
      <VisitsPanel rows={rows} />
      <ReportTable>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Lượt khám</TableHead>
            <TableHead>Biến động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((row, index) => {
            const prev = filteredRows[index - 1]?.visitCount ?? row.visitCount;
            const delta = numberValue(row.visitCount) - numberValue(prev);
            return (
              <TableRow key={`${row.date}-${index}`}>
                <TableCell className="font-semibold">{formatDate(row.date)}</TableCell>
                <TableCell>{row.visitCount}</TableCell>
                <TableCell>
                  <Badge variant={delta >= 0 ? "success" : "danger"}>{delta >= 0 ? "+" : ""}{delta}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </ReportTable>
    </div>
  );
}

function MedicinesReport({ payload, query }: { payload: ReportsPayload; query: string }) {
  const rows = payload.data.medicines;
  const filteredRows = rows.filter((row) => row.medicineName.toLowerCase().includes(query.toLowerCase()));
  const topRows = rows.slice(0, 12);
  const maxUsed = Math.max(...rows.map((row) => numberValue(row.totalUsed)), 1);

  return (
    <div className="grid gap-5">
      <MedicineUsagePanel rows={topRows} />
      <ReportTable>
        <TableHeader>
          <TableRow>
            <TableHead>Thuốc</TableHead>
            <TableHead>Số lượng dùng</TableHead>
            <TableHead>Đơn thuốc</TableHead>
            <TableHead>Mức phổ biến</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((row) => (
            <TableRow key={row.medicineName}>
              <TableCell className="font-semibold">{row.medicineName}</TableCell>
              <TableCell>{row.totalUsed}</TableCell>
              <TableCell>{row.prescriptionCount}</TableCell>
              <TableCell>
                <div className="flex min-w-44 items-center gap-3">
                  <Progress value={(numberValue(row.totalUsed) / maxUsed) * 100} indicatorClassName="bg-teal-600" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {Math.round((numberValue(row.totalUsed) / maxUsed) * 100)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ReportTable>
    </div>
  );
}

function DischargesReport({ payload, query }: { payload: ReportsPayload; query: string }) {
  const rows = payload.data.discharges;
  const filteredRows = rows.filter((row) =>
    [row.patientName, row.patientCode, row.paymentStatus, row.dischargeCondition]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const byPayment = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.paymentStatus] = (acc[row.paymentStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <PaymentStatusPanel rows={Object.entries(byPayment)} />
      <ReportTable className="xl:col-span-1">
        <TableHeader>
          <TableRow>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>Ngày xuất viện</TableHead>
            <TableHead>Điều kiện ra viện</TableHead>
            <TableHead>Thanh toán</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((row: DischargeRow, index) => (
            <TableRow key={`${row.patientName}-${row.dischargeDate}-${index}`}>
              <TableCell>
                <div className="font-semibold">{row.patientName}</div>
                {row.patientCode ? <div className="text-xs text-muted-foreground">{row.patientCode}</div> : null}
              </TableCell>
              <TableCell>{formatDate(row.dischargeDate)}</TableCell>
              <TableCell className="max-w-md">{row.dischargeCondition || "-"}</TableCell>
              <TableCell>
                <Badge variant={paymentVariant(row.paymentStatus)}>{row.paymentStatus}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ReportTable>
    </div>
  );
}

function percentValue(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function EmptyReportState() {
  return (
    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      Chưa có dữ liệu phù hợp với bộ lọc hiện tại.
    </div>
  );
}

function OccupancyPanel({ rows }: { rows: InpatientRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Công suất khoa phòng</CardTitle>
        <CardDescription>So sánh bệnh nhân hiện có với tổng số giường</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length ? (
          rows.map((row) => {
            const occupancy = percentValue(numberValue(row.patientCount), numberValue(row.totalBeds));
            return (
              <div key={row.departmentName} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{row.departmentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.patientCount}/{row.totalBeds} giường đang sử dụng
                    </p>
                  </div>
                  <Badge variant={occupancy > 90 ? "danger" : occupancy > 75 ? "warning" : "success"}>
                    {occupancy}%
                  </Badge>
                </div>
                <Progress
                  value={occupancy}
                  indicatorClassName={occupancy > 90 ? "bg-rose-500" : occupancy > 75 ? "bg-amber-500" : "bg-sky-600"}
                />
              </div>
            );
          })
        ) : (
          <EmptyReportState />
        )}
      </CardContent>
    </Card>
  );
}

function RevenuePanel({ rows }: { rows: RevenueRow[] }) {
  const maxTotal = Math.max(...rows.map((row) => numberValue(row.revenue) + numberValue(row.insurance)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dòng tiền viện phí</CardTitle>
        <CardDescription>Thực thu và phần BHYT hỗ trợ theo tháng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length ? (
          rows.map((row) => {
            const revenue = numberValue(row.revenue);
            const insurance = numberValue(row.insurance);
            const total = revenue + insurance;
            const totalWidth = percentValue(total, maxTotal);
            const revenueShare = percentValue(revenue, total);
            const insuranceShare = Math.max(0, 100 - revenueShare);
            return (
              <div key={row.month} className="rounded-md border p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{row.month}</span>
                  <span className="text-sm font-bold">{formatCurrency(total)}</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="flex h-3 overflow-hidden rounded-full" style={{ width: `${totalWidth}%` }}>
                    <div className="bg-sky-600" style={{ width: `${revenueShare}%` }} />
                    <div className="bg-emerald-500" style={{ width: `${insuranceShare}%` }} />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Thực thu: {formatCurrency(revenue)}</span>
                  <span>BHYT: {formatCurrency(insurance)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyReportState />
        )}
      </CardContent>
    </Card>
  );
}

function VisitsPanel({ rows }: { rows: VisitRow[] }) {
  const maxVisits = Math.max(...rows.map((row) => numberValue(row.visitCount)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lượt tiếp nhận 30 ngày</CardTitle>
        <CardDescription>Theo ngày nhập viện/tiếp nhận gần nhất</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.length ? (
          rows.map((row) => {
            const value = numberValue(row.visitCount);
            return (
              <div key={row.date} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{formatDate(row.date)}</span>
                  <span className="text-lg font-extrabold">{compactNumber(value)}</span>
                </div>
                <Progress value={percentValue(value, maxVisits)} indicatorClassName="bg-indigo-600" />
              </div>
            );
          })
        ) : (
          <div className="sm:col-span-2 xl:col-span-3">
            <EmptyReportState />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MedicineUsagePanel({ rows }: { rows: MedicineRow[] }) {
  const maxUsed = Math.max(...rows.map((row) => numberValue(row.totalUsed)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top thuốc sử dụng</CardTitle>
        <CardDescription>Xếp hạng theo tổng số lượng đã dùng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length ? (
          rows.map((row) => {
            const value = numberValue(row.totalUsed);
            return (
              <div key={row.medicineName} className="rounded-md border p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{row.medicineName}</span>
                  <span className="text-sm font-bold">{compactNumber(value)}</span>
                </div>
                <Progress value={percentValue(value, maxUsed)} indicatorClassName="bg-teal-600" />
                <p className="mt-2 text-xs text-muted-foreground">{row.prescriptionCount} đơn thuốc</p>
              </div>
            );
          })
        ) : (
          <EmptyReportState />
        )}
      </CardContent>
    </Card>
  );
}

function PaymentStatusPanel({ rows }: { rows: Array<[string, number]> }) {
  const total = rows.reduce((sum, [, value]) => sum + value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái thanh toán</CardTitle>
        <CardDescription>Tỷ trọng hồ sơ xuất viện theo trạng thái</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length ? (
          rows.map(([status, count]) => {
            const value = percentValue(count, total);
            return (
              <div key={status} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant={paymentVariant(status)}>{status}</Badge>
                  <span className="text-sm font-bold">
                    {count} hồ sơ · {value}%
                  </span>
                </div>
                <Progress value={value} indicatorClassName={value > 60 ? "bg-sky-600" : "bg-emerald-500"} />
              </div>
            );
          })
        ) : (
          <EmptyReportState />
        )}
      </CardContent>
    </Card>
  );
}

function ReportTable({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="report-scrollbar overflow-x-auto">
          <Table>{children}</Table>
        </div>
      </CardContent>
    </Card>
  );
}
