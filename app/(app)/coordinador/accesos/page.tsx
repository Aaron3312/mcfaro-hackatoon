// Redirige /coordinador/accesos → /coordinador/usuarios
import { redirect } from "next/navigation";

export default function AccesosPage() {
  redirect("/coordinador/usuarios");
}
