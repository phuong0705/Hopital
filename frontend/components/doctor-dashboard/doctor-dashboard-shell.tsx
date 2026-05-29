"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  Clipboard,
  ListTodo,
  Microscope,
  RefreshCw,
  ScanSearch,
  Search,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EChartsPanel } from "@/components/reports/echarts-panel";
import type {
  DoctorDashboardLabRow,
  DoctorDashboardPayload,
  DoctorDashboardProcedureRow,
  DoctorDashboardTab,
  DoctorDashboardWorklistItem
} from "@/components/doctor-dashboard/types";
import { compactNumber, formatDate } from "@/lib/utils";

const tabLabels: Record<DoctorDashboardTab, string> = {
  patients: "Hồ sơ bệnh nhân",
  worklist: "Công việc cần làm",
  labs: "Cận lâm sàng",
  procedures: "Thủ thuật"
};

const tabIcons: Record<DoctorDashboardTab, ReactNode> = {
  patients: <Clipboard className="h-4 w-4" />,
  worklist: <ListTodo className="h-4 w-4" />,
  labs: <Microscope className="h-4 w-4" />,
  procedures: <ScanSearch className="h-4 w-4" />
};

function numberValue(value: unknown) {
  return Number(value || 0);
}

function badgeVariant(value: string): "success" | "warning" | "danger" | "outline" {
  const normalized = value.toLowerCase();
  if (normalized.includes("nguy") || normalized.includes("cao") || normalized.includes("chờ")) return "danger";
  if (normalized.includes("theo dõi") || normalized.includes("đang")) return "warning";
  if (normalized.includes("ổn") || normalized.includes("đã")) return "success";
  return "outline";
}

export function DoctorDashboardShell({
  initialPayload,
  apiBaseUrl
}: {
  initialPayload: DoctorDashboardPayload | null;
  apiBaseUrl: string;
}) {
  const [payload, setPayload] = useState<DoctorDashboardPayload | null>(initialPayload);
  const [activeTab, setActiveTab] = useState<DoctorDashboardTab>("patients");
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const kpis = useMemo(() => {
    if (!payload) return [];

    return [
      {
        label: "Bệnh nhân phụ trách",
        value: compactNumber(payload.summary.activePatients),
        detail: `${payload.summary.departmentOccupancy}% công suất khoa`,
        icon: <Stethoscope className="h-5 w-5 text-sky-700" />
      },
      {
        label: "Bệnh nhân cần chú ý",
        value: compactNumber(payload.summary.highRiskPatients),
        detail: "Có dấu hiệu sinh tồn bất thường",
        icon: <AlertTriangle className="h-5 w-5 text-rose-700" />
      },
      {
        label: "Việc cần xử lý",
        value: compactNumber(payload.worklist.length),
        detail: "Đôn đốc, duyệt kết quả & hồ sơ",
        icon: <ListTodo className="h-5 w-5 text-indigo-700" />
      },
      {
        label: "Thủ thuật trong ngày",
        value: compactNumber(payload.summary.proceduresToday),
        detail: "Mổ, can thiệp, nội soi",
        icon: <ScanSearch className="h-5 w-5 text-amber-700" />
      },
      {
        label: "Hồ sơ chờ xuất viện",
        value: compactNumber(payload.summary.dischargeQueue),
        detail: "Cần hoàn thiện y lệnh",
        icon: <BedDouble className="h-5 w-5 text-emerald-700" />
      }
    ];
  }, [payload]);

  const departmentOption: EChartsOption = useMemo(() => {
    const rows = payload?.charts.departmentLoad || [];
    return {
      color: ["#0284c7", "#0f766e"],
      tooltip: { trigger: "axis" },
      legend: { top: 0 },
      grid: { left: 46, right: 24, top: 48, bottom: 60 },
      xAxis: {
        type: "category",
        data: rows.map((row) => row.departmentName),
        axisLabel: { rotate: 18 }
      },
      yAxis: { type: "value" },
      series: [
        { name: "Bệnh nhân", type: "bar", data: rows.map((row) => numberValue(row.patientCount)), barMaxWidth: 28 },
        { name: "Tổng giường", type: "line", smooth: true, data: rows.map((row) => numberValue(row.totalBeds)) }
      ]
    };
  }, [payload]);

  const trendOption: EChartsOption = useMemo(() => {
    const rows = payload?.charts.admissionTrend || [];
    return {
      color: ["#2563eb"],
      tooltip: { trigger: "axis" },
      grid: { left: 42, right: 20, top: 28, bottom: 36 },
      xAxis: { type: "category", data: rows.map((row) => row.label) },
      yAxis: { type: "value" },
      series: [
        {
          name: "Hồ sơ nhận mới",
          type: "line",
          smooth: true,
          areaStyle: { opacity: 0.18 },
          data: rows.map((row) => numberValue(row.total))
        }
      ]
    };
  }, [payload]);

  const statusOption: EChartsOption = useMemo(() => {
    const rows = payload?.charts.patientStatuses || [];
    return {
      color: ["#0284c7", "#f59e0b", "#10b981", "#ef4444"],
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          name: "Tình trạng điều trị",
          type: "pie",
          radius: ["44%", "68%"],
          center: ["50%", "42%"],
          data: rows.map((row) => ({ name: row.name, value: row.value }))
        }
      ]
    };
  }, [payload]);

  const filteredPatients = useMemo(() => {
    return (payload?.lists.patients || []).filter((row) =>
      [row.patientCode, row.fullName, row.diagnosis, row.status, row.priorityLevel]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [payload, query]);

  const filteredLabs = useMemo(() => {
    return (payload?.lists.labs || []).filter((row) =>
      [row.testCode, row.patientName, row.testType, row.status]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [payload, query]);

  const filteredProcedures = useMemo(() => {
    return (payload?.lists.procedures || []).filter((row) =>
      [row.patientCode, row.patientName, row.treatmentContent, row.assigneeName, row.status]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [payload, query]);

  const filteredWorklist = useMemo(() => {
    return (payload?.worklist || []).filter((row) =>
      [row.type, row.title, row.patient].join(" ").toLowerCase().includes(query.toLowerCase())
    );
  }, [payload, query]);

  async function refreshDashboard() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/summary", { cache: "no-store" });
      if (response.ok) {
        setPayload(await response.json());
      } else {
        setPayload(null);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-background report-grid-bg p-4 sm:p-8">
        <Card className="mx-auto mt-16 max-w-xl">
          <CardHeader>
            <CardTitle>Chưa lấy được dashboard bác sĩ</CardTitle>
            <CardDescription>Đăng nhập lại ở backend Express rồi mở lại màn hình tra cứu.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <a href={`${apiBaseUrl}/login`}>Đăng nhập</a>
            </Button>
            <Button variant="outline" onClick={refreshDashboard} type="button">
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background report-grid-bg pb-12">
      <section className="container py-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-sky-100 text-sky-800 hover:bg-sky-100">
                Shift Dashboard
              </Badge>
              <Badge variant="outline" className="gap-1 border-sky-200">
                <UserCheck className="h-3.5 w-3.5 text-sky-600" />
                BS. {payload.user.fullName}
              </Badge>
              <Badge variant="outline" className="gap-1 border-sky-200">
                <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
                {payload.user.shiftName}
              </Badge>
              {payload.user.departmentName ? (
                <Badge variant="outline" className="border-sky-200">
                  {payload.user.departmentName}
                </Badge>
              ) : null}
              <span className="text-sm text-muted-foreground">Cập nhật lúc {formatDate(payload.generatedAt)}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Trung tâm điều hành ca trực
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" type="button" asChild>
              <a href={`${apiBaseUrl}/dashboard/home`}>HIS Home</a>
            </Button>
            <Button variant="outline" type="button" onClick={() => window.print()}>
              Xuất PDF
            </Button>
            <Button type="button" onClick={refreshDashboard} disabled={isRefreshing} className="bg-sky-700 hover:bg-sky-800">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới dữ liệu
            </Button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className="overflow-hidden border-l-4 border-l-sky-500 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sky-900">{kpi.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-2 rounded-lg border shadow-sm">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DoctorDashboardTab)} className="w-full">
                <TabsList className="bg-muted/50 w-full sm:w-auto">
                  {(Object.keys(tabLabels) as DoctorDashboardTab[]).map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="gap-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {tabIcons[tab]}
                      <span className="hidden sm:inline">{tabLabels[tab]}</span>
                      <span className="sm:hidden">{tabLabels[tab].split(" ")[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 border-muted-foreground/20 focus-visible:ring-sky-500"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tra cứu nhanh..."
                />
              </div>
            </div>

            <div className="transition-all">
              {activeTab === "patients" ? <PatientsTable rows={filteredPatients} /> : null}
              {activeTab === "worklist" ? <WorklistTable rows={filteredWorklist} /> : null}
              {activeTab === "labs" ? <LabsTable rows={filteredLabs} /> : null}
              {activeTab === "procedures" ? <ProceduresTable rows={filteredProcedures} /> : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <EChartsPanel
                title="Tải bệnh nhân tại khoa"
                description="Công suất sử dụng giường bệnh thực tế."
                option={departmentOption}
                height={300}
              />
              <EChartsPanel
                title="Theo dõi nhận bệnh"
                description="Xu hướng hồ sơ mới trong tuần."
                option={trendOption}
                height={300}
              />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-rose-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-rose-50/50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-900 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Cảnh báo lâm sàng
                  </CardTitle>
                  <Badge className="bg-rose-600">{payload.clinicalAlerts.length}</Badge>
                </div>
                <CardDescription className="text-rose-700/70">Dấu hiệu sinh tồn & Priority cao</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-rose-100 max-h-[400px] overflow-y-auto report-scrollbar">
                  {payload.clinicalAlerts.map((alert, idx) => (
                    <div key={idx} className="p-4 hover:bg-rose-50/30 transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-bold text-rose-950">{alert.fullName}</div>
                        <Badge variant="outline" className="border-rose-200 text-rose-700 text-[10px] py-0">{alert.bedCode}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alert.alerts.map((a, i) => (
                          <Badge key={i} variant="secondary" className="bg-rose-100 text-rose-800 border-none text-[10px]">
                            {a}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-rose-600/80 italic font-medium">Ưu tiên: {alert.priority}</div>
                    </div>
                  ))}
                  {!payload.clinicalAlerts.length && (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      <p>Không có cảnh báo lâm sàng khẩn cấp</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <EChartsPanel
              title="Phân loại điều trị"
              description="Cơ cấu bệnh nhân theo trạng thái."
              option={statusOption}
              height={300}
            />

            <Card className="bg-sky-900 text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Trực ca & Hỗ trợ</CardTitle>
                <CardDescription className="text-sky-200/70">Thông tin ca trực hiện tại</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-sky-800 flex items-center justify-center border border-sky-700">
                    <UserCheck className="h-5 w-5 text-sky-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Bác sĩ trực chính</div>
                    <div className="text-xs text-sky-200">TS.BS Nguyễn Minh Khôi</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-sky-800 flex items-center justify-center border border-sky-700">
                    <Activity className="h-5 w-5 text-sky-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Điều dưỡng trực</div>
                    <div className="text-xs text-sky-200">Trần Thị Mai & 02 cộng sự</div>
                  </div>
                </div>
                <Button className="w-full bg-white text-sky-900 hover:bg-sky-50 mt-2 font-bold">
                  Bàn giao ca trực
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function PatientsTable({ rows }: { rows: DoctorDashboardPayload["lists"]["patients"] }) {
  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Danh sách bệnh nhân nội trú</CardTitle>
        <CardDescription>Bệnh nhân đang trực tiếp phụ trách điều trị.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="report-scrollbar overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Bệnh nhân</TableHead>
                <TableHead className="font-bold">Dấu hiệu sinh tồn</TableHead>
                <TableHead className="font-bold">Chẩn đoán</TableHead>
                <TableHead className="font-bold">Khoa / Giường</TableHead>
                <TableHead className="font-bold">Ưu tiên</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.admissionId} className="hover:bg-sky-50/20">
                  <TableCell>
                    <div className="font-bold text-sky-950">{row.fullName}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{row.patientCode}</div>
                  </TableCell>
                  <TableCell>
                    {row.vitalsParsed ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {row.vitalsParsed.alerts.map((a, i) => (
                          <span key={i} className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded border border-rose-100">{a}</span>
                        ))}
                        {!row.vitalsParsed.alerts.length && row.vitalSigns !== "Mạch: --; Huyết áp: --; Nhiệt độ: --; SpO2: --" ? (
                          <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1 rounded border border-emerald-100">Ổn định</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Chưa khám</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[240px] text-xs leading-relaxed">{row.diagnosis}</TableCell>
                  <TableCell className="text-xs font-medium">{[row.departmentName, row.roomCode, row.bedCode].filter(Boolean).join(" · ")}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(row.priorityLevel)} className="text-[10px] px-1.5 py-0">{row.priorityLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(row.status)} className="text-[10px] px-1.5 py-0">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Không có hồ sơ phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function WorklistTable({ rows }: { rows: DoctorDashboardWorklistItem[] }) {
  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Công việc cần thực hiện</CardTitle>
        <CardDescription>Danh mục các đầu việc cần đôn đốc và hoàn thiện trong ca trực.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="report-scrollbar overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Loại việc</TableHead>
                <TableHead className="font-bold w-1/2">Nội dung</TableHead>
                <TableHead className="font-bold">Bệnh nhân</TableHead>
                <TableHead className="font-bold">Ưu tiên</TableHead>
                <TableHead className="font-bold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-indigo-50/20">
                  <TableCell>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px]">{row.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{row.title}</TableCell>
                  <TableCell className="text-slate-600">{row.patient}</TableCell>
                  <TableCell>
                    <Badge variant={row.priority === "High" ? "danger" : row.priority === "Medium" ? "warning" : "outline"} className="text-[10px]">
                      {row.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-sky-700 hover:text-sky-800 hover:bg-sky-50">Xử lý</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-emerald-600 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-8 w-8" />
                      Chúc mừng! Bạn đã hoàn thành tất cả công việc trong danh sách.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LabsTable({ rows }: { rows: DoctorDashboardLabRow[] }) {
  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Theo dõi cận lâm sàng</CardTitle>
        <CardDescription>Các chỉ định xét nghiệm, CDHA đang chờ kết quả.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="report-scrollbar overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Mã phiếu</TableHead>
                <TableHead className="font-bold">Bệnh nhân</TableHead>
                <TableHead className="font-bold">Loại chỉ định</TableHead>
                <TableHead className="font-bold">Kết quả sơ bộ</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.testCode} className="hover:bg-sky-50/20">
                  <TableCell className="font-mono text-xs font-bold text-sky-800">{row.testCode}</TableCell>
                  <TableCell className="font-medium">{row.patientName}</TableCell>
                  <TableCell className="text-slate-600">{row.testType}</TableCell>
                  <TableCell className="max-w-[200px] text-xs italic text-muted-foreground">{row.resultSummary || "Đang chờ máy..."}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(row.status)} className="text-[10px] px-1.5 py-0">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Không có cận lâm sàng nào cần theo dõi.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ProceduresTable({ rows }: { rows: DoctorDashboardProcedureRow[] }) {
  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Lịch can thiệp & Thủ thuật</CardTitle>
        <CardDescription>Theo dõi các ca mổ, nội soi và thủ thuật trong ngày.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="report-scrollbar overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Bệnh nhân</TableHead>
                <TableHead className="font-bold">Nội dung thực hiện</TableHead>
                <TableHead className="font-bold">Thời gian dự kiến</TableHead>
                <TableHead className="font-bold">Người thực hiện</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.scheduleId} className="hover:bg-amber-50/20">
                  <TableCell>
                    <div className="font-bold text-amber-950">{row.patientName}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{row.patientCode}</div>
                  </TableCell>
                  <TableCell className="max-w-md font-medium text-slate-800">{row.treatmentContent}</TableCell>
                  <TableCell className="text-xs">{formatDate(row.scheduledTime)}</TableCell>
                  <TableCell className="text-xs">{row.assigneeName}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(row.status)} className="text-[10px] px-1.5 py-0">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Chưa có lịch thủ thuật riêng trong ngày.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
