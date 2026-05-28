export type ReportKey = "inpatient" | "revenue" | "visits" | "medicines" | "discharges";

export type InpatientRow = {
  departmentName: string;
  patientCount: number;
  totalBeds: number;
};

export type RevenueRow = {
  month: string;
  revenue: number;
  insurance: number;
};

export type VisitRow = {
  date: string;
  visitCount: number;
};

export type MedicineRow = {
  medicineName: string;
  totalUsed: number;
  prescriptionCount: number;
};

export type DischargeRow = {
  dischargeId?: number;
  patientCode?: string;
  patientName: string;
  dischargeCondition?: string;
  dischargeDate?: string;
  treatmentSummary?: string;
  totalCost?: number;
  paymentStatus: string;
};

export type ReportsPayload = {
  generatedAt: string;
  user: {
    fullName?: string;
    roleCode: string;
    reportScope?: string | null;
  };
  permissions: Record<ReportKey, boolean>;
  data: {
    inpatient: InpatientRow[];
    revenue: RevenueRow[];
    visits: VisitRow[];
    medicines: MedicineRow[];
    discharges: DischargeRow[];
  };
};
