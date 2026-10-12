import { redirect } from "next/navigation";
import { endSession } from "@/lib/auth";

export async function POST() {
  await endSession();
  redirect("/");
}
