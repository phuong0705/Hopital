import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";

const HIS_URL = process.env.NEXT_PUBLIC_HIS_URL || API_URL;

export default function Home() {
  redirect(new URL("/", HIS_URL).toString());
}
