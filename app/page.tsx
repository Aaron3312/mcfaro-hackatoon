// Página raíz — redirige según estado de autenticación
import { redirect } from "next/navigation";

export default function Home() {
  // El middleware maneja la redirección a /login si no hay sesión
  // Si hay sesión, enviamos al dashboard
  redirect("/dashboard");
}
