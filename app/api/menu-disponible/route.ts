// Endpoint POST /api/menu-disponible — notifica a familias cuando comida está lista
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";

const BodySchema = z.object({
  casaRonald: z.string().min(1),
  comidaTipo: z.enum(["desayuno", "comida", "cena"]),
  menuId: z.string().min(1),
});

const etiquetasComida = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const resultado = BodySchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const { casaRonald, comidaTipo, menuId } = resultado.data;

  try {
    // Obtener todas las familias de esta Casa Ronald con token FCM
    const familiasSnapshot = await adminDb
      .collection("familias")
      .where("casaRonald", "==", casaRonald)
      .get();

    const familiasConToken = familiasSnapshot.docs.filter(
      (doc) => doc.data().fcmToken
    );

    if (familiasConToken.length === 0) {
      return NextResponse.json({ enviadas: 0, mensaje: "No hay familias con FCM token" });
    }

    // Obtener descripción del menú
    const menuDoc = await adminDb.collection("menus").doc(menuId).get();
    if (!menuDoc.exists) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    }

    const menuData = menuDoc.data();
    const descripcion = menuData?.comidas[comidaTipo]?.descripcion || "Menú del día";

    // Enviar notificación a cada familia
    const etiqueta = etiquetasComida[comidaTipo];
    let enviadas = 0;

    for (const familiaDoc of familiasConToken) {
      const fcmToken = familiaDoc.data().fcmToken as string;

      try {
        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: `¡${etiqueta} listo! 🍽️`,
            body: `${descripcion} - Recuerda que es gratuito ❤️`,
          },
          webpush: {
            fcmOptions: {
              link: "/menu",
            },
            notification: {
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
            },
          },
        });
        enviadas++;
      } catch (error) {
        console.error(`Error al enviar notificación a ${familiaDoc.id}:`, error);
      }
    }

    return NextResponse.json({ enviadas });
  } catch (error) {
    console.error("Error al enviar notificaciones:", error);
    return NextResponse.json({ error: "Error al enviar notificaciones" }, { status: 500 });
  }
}
