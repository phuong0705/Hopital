import { redirect } from "next/navigation";

export default async function DoctorDashboardPage() {
  redirect("/dashboard/home");
}
