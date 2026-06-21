import { redirect } from "next/navigation";

export default function AdminSettingPage() {
  redirect("/v3/system/configuration-device-registration");
}
