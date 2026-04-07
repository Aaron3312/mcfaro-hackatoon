import { redirect } from "next/navigation";

// Redirige a login — la autenticación decide si va al dashboard
export default function RootPage() {
  redirect("/login");
}
