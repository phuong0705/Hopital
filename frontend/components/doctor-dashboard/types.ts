export type DoctorDashboardTab = "patients" | "labs" | "procedures" | "worklist";

export type DoctorDashboardPatientRow = {
  admissionId: number;
  patientId: number;
  patientCode: string;
  fullName: string;
  gender: string;
  diagnosis: string;
  departmentName: string;
  roomCode?: string;
  bedCode?: string;
  doctorName?: string;
  admissionDate: string;
  status: string;
  priorityLevel: string;
  vitalSigns?: string;
  vitalsParsed?: {
    pulse: number | null;
    bp: string | null;
    temp: number | null;
    spo2: number | null;
    isAbnormal: boolean;
    alerts: string[];
  };
};

export type DoctorDashboardLabRow = {
  testCode: string;
  patientName: string;
  testType: string;
  orderedDate: string;
  status: string;
  resultSummary?: string | null;
  doctorName?: string;
};

export type DoctorDashboardProcedureRow = {
  scheduleId: number;
  recordId: number;
  patientCode: string;
  patientName: string;
  gender: string;
  priorityLevel: string;
  diagnosis?: string;
  departmentName: string;
  roomCode?: string;
  bedCode?: string;
  treatmentContent: string;
  assigneeName: string;
  scheduledTime: string;
  status: string;
  note?: string | null;
};

export type DoctorDashboardWorklistItem = {
  type: string;
  title: string;
  patient: string;
  priority: "High" | "Medium" | "Normal";
};

export type DoctorDashboardClinicalAlert = {
  patientId: number;
  fullName: string;
  bedCode?: string;
  alerts: string[];
  priority: string;
};

export type DoctorDashboardPayload = {
  generatedAt: string;
  user: {
    fullName: string;
    roleCode: string;
    specialty?: string | null;
    shiftName?: string | null;
    departmentName?: string | null;
  };
  summary: {
    activePatients: number;
    highRiskPatients: number;
    pendingLabs: number;
    proceduresToday: number;
    dischargeQueue: number;
    departmentOccupancy: number;
  };
  clinicalAlerts: DoctorDashboardClinicalAlert[];
  worklist: DoctorDashboardWorklistItem[];
  charts: {
    admissionTrend: Array<{ label: string; total: number }>;
    departmentLoad: Array<{ departmentName: string; patientCount: number; totalBeds: number }>;
    patientStatuses: Array<{ name: string; value: number }>;
  };
  lists: {
    patients: DoctorDashboardPatientRow[];
    labs: DoctorDashboardLabRow[];
    procedures: DoctorDashboardProcedureRow[];
  };
};
