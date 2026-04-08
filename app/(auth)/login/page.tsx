"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Shield } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import gsap from "gsap";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

/* Coordenadas del faro en el SVG (viewBox 0 0 400 240) */
const FARO_X = 52;
const FARO_Y = 136;
const SV = `${FARO_X} ${FARO_Y}`;

/* Estrellas pre-generadas (evita mismatch SSR/cliente) */
const STARS: Array<[number, number, number, number]> = [
  [6, 5, 0.9, 0.9],   [18, 9, 0.7, 0.6],   [31, 4, 1.1, 0.8],
  [44, 11, 0.8, 0.9],  [57, 6, 1.3, 0.7],   [70, 14, 0.7, 0.8],
  [83, 8, 1.0, 0.6],   [94, 4, 0.9, 0.9],   [12, 20, 0.8, 0.7],
  [27, 17, 1.2, 0.9],  [42, 23, 0.7, 0.6],  [60, 19, 1.0, 0.8],
  [75, 25, 0.8, 0.7],  [88, 21, 1.1, 0.9],  [5, 33, 0.9, 0.6],
  [22, 38, 0.7, 0.8],  [38, 30, 1.2, 0.9],  [53, 36, 0.8, 0.7],
  [67, 32, 1.0, 0.6],  [80, 40, 0.9, 0.8],  [95, 35, 0.7, 0.9],
  [10, 48, 1.1, 0.7],  [26, 44, 0.8, 0.6],  [41, 52, 0.9, 0.9],
  [56, 47, 1.3, 0.8],  [72, 55, 0.7, 0.7],  [87, 50, 1.0, 0.6],
  [3, 60, 0.8, 0.8],   [19, 58, 1.1, 0.9],  [35, 65, 0.7, 0.7],
];

type Paso = "telefono" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("telefono");
  const [telefono, setTelefono] = useState("");
  const [otp, setOtp] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState<ConfirmationResult | null>(
    null
  );
  const inicializado = useRef(false);

  // Refs para animaciones
  const svgRef = useRef<SVGSVGElement>(null);
  const beamRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const starGroupRef = useRef<SVGGElement>(null);
  const wave1Ref = useRef<SVGPathElement>(null);
  const wave2Ref = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Control del haz
  const beamTweenRef = useRef<gsap.core.Timeline | null>(null);
  const esDesktopRef = useRef(false);
  // Ángulo acumulado — evita saltos bruscos al cruzar ±180°
  const anguloActualRef = useRef(30);
  // Tracking del hover del haz sobre el botón
  const btnIluminadoRef = useRef(false);

  /* ── Convierte coordenadas de pantalla → ángulo continuo desde el faro ── */
  const calcularAngulo = useCallback(
    (screenX: number, screenY: number): number => {
      const svg = svgRef.current;
      if (!svg) return anguloActualRef.current;
      const ctm = svg.getScreenCTM();
      if (!ctm) return anguloActualRef.current;
      const pt = svg.createSVGPoint();
      pt.x = screenX;
      pt.y = screenY;
      const svgPt = pt.matrixTransform(ctm.inverse());
      const dx = svgPt.x - FARO_X;
      const dy = svgPt.y - FARO_Y;
      const anguloRaw = Math.atan2(dy, dx) * (180 / Math.PI);

      // Ajustar al equivalente más cercano al ángulo actual (camino más corto)
      const prev = anguloActualRef.current;
      let delta = anguloRaw - prev;
      // Normalizar delta a rango (-180, 180]
      delta = ((delta + 180) % 360 + 360) % 360 - 180;
      const angulo = prev + delta;

      anguloActualRef.current = angulo;
      return angulo;
    },
    []
  );

  /* ── Ángulo raw de un punto en pantalla (sin modificar anguloActualRef) ── */
  const anguloRawDe = useCallback(
    (screenX: number, screenY: number): number => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const ctm = svg.getScreenCTM();
      if (!ctm) return 0;
      const pt = svg.createSVGPoint();
      pt.x = screenX;
      pt.y = screenY;
      const svgPt = pt.matrixTransform(ctm.inverse());
      return Math.atan2(svgPt.y - FARO_Y, svgPt.x - FARO_X) * (180 / Math.PI);
    },
    []
  );

  /* ── Verifica si el haz está apuntando al botón y lo resalta ── */
  const verificarHoverHaz = useCallback(() => {
    const btn = btnRef.current;
    const beam = beamRef.current;
    if (!btn || !beam) return;

    const rotacion = gsap.getProperty(beam, "rotation") as number;
    const rect = btn.getBoundingClientRect();
    const anguloBtn = anguloRawDe(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );

    // Normalizar diferencia a (-180, 180]
    let diff = rotacion - anguloBtn;
    diff = ((diff + 180) % 360 + 360) % 360 - 180;

    // El haz core tiene ~6° de ancho a cada lado; usamos 8° de tolerancia
    const UMBRAL = 8;

    if (Math.abs(diff) < UMBRAL && !btnIluminadoRef.current) {
      btnIluminadoRef.current = true;
      gsap.killTweensOf(btn);
      gsap.to(btn, {
        boxShadow:
          "0 0 50px rgba(248,208,80,0.75), 0 0 100px rgba(248,208,80,0.3), 0 4px 24px rgba(0,0,0,0.4)",
        scale: 1.05,
        duration: 0.25,
        ease: "power2.out",
      });
      // También iluminar borde del form
      if (formRef.current) {
        gsap.to(formRef.current, {
          borderColor: "rgba(248,208,80,0.3)",
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    } else if (Math.abs(diff) >= UMBRAL && btnIluminadoRef.current) {
      btnIluminadoRef.current = false;
      gsap.killTweensOf(btn);
      gsap.to(btn, {
        boxShadow:
          "0 0 20px rgba(248,208,80,0.15), 0 4px 16px rgba(0,0,0,0.3)",
        scale: 1,
        duration: 0.4,
        ease: "power2.in",
      });
      if (formRef.current) {
        gsap.to(formRef.current, {
          borderColor: "rgba(255,255,255,0.1)",
          duration: 0.4,
          ease: "power2.in",
          overwrite: "auto",
        });
      }
    }
  }, [anguloRawDe]);

  /* ── Construye el timeline de barrido automático (mobile) ── */
  const construirBarrido = useCallback(() => {
    beamTweenRef.current?.kill();
    const tl = gsap.timeline({ repeat: -1, onUpdate: verificarHoverHaz });
    tl.to(beamRef.current, {
      rotation: 55,
      svgOrigin: SV,
      duration: 4,
      ease: "sine.inOut",
    });
    tl.to(beamRef.current, {
      rotation: 58,
      svgOrigin: SV,
      duration: 1.5,
      ease: "sine.inOut",
    });
    tl.to(beamRef.current, {
      rotation: 0,
      svgOrigin: SV,
      duration: 4,
      ease: "sine.inOut",
    });
    beamTweenRef.current = tl;
  }, [verificarHoverHaz]);

  /* ── Anima el haz hacia el botón y lo ilumina ── */
  const iluminarBoton = useCallback(
    (callback: () => void) => {
      const btn = btnRef.current;
      if (!btn) {
        callback();
        return;
      }

      const rect = btn.getBoundingClientRect();
      const angulo = calcularAngulo(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );

      // Detener animación actual del haz
      beamTweenRef.current?.kill();
      gsap.killTweensOf(beamRef.current);

      const duracionHaz = esDesktopRef.current ? 0.25 : 0.6;
      const tl = gsap.timeline({ onComplete: callback });

      // Mover haz al botón
      tl.to(beamRef.current, {
        rotation: angulo,
        svgOrigin: SV,
        duration: duracionHaz,
        ease: "power2.out",
      });

      // Ráfaga de luz en el botón
      tl.to(
        btn,
        {
          boxShadow:
            "0 0 60px rgba(248,208,80,0.8), 0 0 120px rgba(248,208,80,0.35), 0 4px 30px rgba(0,0,0,0.4)",
          scale: 1.04,
          duration: 0.3,
          ease: "power2.out",
        },
        `-=${duracionHaz * 0.3}`
      );

      // Brillo del form
      if (formRef.current) {
        tl.to(
          formRef.current,
          {
            borderColor: "rgba(248,208,80,0.35)",
            boxShadow: "0 0 40px rgba(248,208,80,0.12)",
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        );
      }

      // Volver a estado normal
      tl.to(btn, {
        boxShadow:
          "0 0 30px rgba(248,208,80,0.4), 0 4px 20px rgba(0,0,0,0.3)",
        scale: 1,
        duration: 0.2,
        ease: "power2.in",
      });

      if (formRef.current) {
        tl.to(
          formRef.current,
          {
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            duration: 0.3,
            ease: "power2.in",
          },
          "<"
        );
      }
    },
    [calcularAngulo]
  );

  /* ── Firebase: reCAPTCHA ── */
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
    return () => {
      try {
        window.recaptchaVerifier?.clear();
      } catch (_) {
        /* ignorar */
      }
      window.recaptchaVerifier = undefined;
    };
  }, []);

  /* ── Animaciones GSAP + mouse tracking (desktop) / barrido (mobile) ── */
  useEffect(() => {
    esDesktopRef.current = window.matchMedia("(hover: hover)").matches;

    const ctx = gsap.context(() => {
      // Pulso de la linterna
      gsap.to(glowRef.current, {
        r: 13,
        opacity: 0.45,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Estrellas — parpadeo
      if (starGroupRef.current) {
        Array.from(starGroupRef.current.querySelectorAll("circle")).forEach(
          (star) => {
            const base = parseFloat(star.getAttribute("opacity") ?? "0.7");
            gsap.to(star, {
              opacity: base * 0.12,
              duration: 1.2 + Math.random() * 2.5,
              repeat: -1,
              yoyo: true,
              delay: Math.random() * 4,
              ease: "sine.inOut",
            });
          }
        );
      }

      // Olas
      gsap.to(wave1Ref.current, {
        y: -3,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(wave2Ref.current, {
        y: -2,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.8,
      });

      // Entrada del contenido
      gsap.fromTo(
        [badgeRef.current, titleRef.current, formRef.current],
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.22,
          delay: 0.4,
          ease: "power3.out",
        }
      );

      // Haz: desktop → posición inicial, mobile → barrido automático
      if (esDesktopRef.current) {
        gsap.set(beamRef.current, { rotation: 30, svgOrigin: SV });
      } else {
        construirBarrido();
      }
    });

    // Desktop: el haz sigue el cursor
    const onMouseMove = (e: MouseEvent) => {
      if (!esDesktopRef.current || !beamRef.current) return;
      const angulo = calcularAngulo(e.clientX, e.clientY);
      gsap.to(beamRef.current, {
        rotation: angulo,
        svgOrigin: SV,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
        onUpdate: verificarHoverHaz,
      });
    };

    if (esDesktopRef.current) {
      window.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [calcularAngulo, construirBarrido, verificarHoverHaz]);

  /* ── Glow base del botón según estado (sin conflicto con hover del haz) ── */
  useEffect(() => {
    if (btnIluminadoRef.current) return; // el haz tiene prioridad
    const habilitado =
      paso === "telefono" ? telefono.length >= 10 : otp.length >= 6;
    if (btnRef.current) {
      gsap.set(btnRef.current, {
        boxShadow: habilitado && !cargando
          ? "0 0 25px rgba(248,208,80,0.3), 0 4px 16px rgba(0,0,0,0.4)"
          : "0 0 20px rgba(248,208,80,0.15), 0 4px 16px rgba(0,0,0,0.3)",
      });
    }
  }, [telefono, otp, paso, cargando]);

  /* ── Acciones de autenticación con efecto de iluminación ── */
  const enviarOTP = useCallback(() => {
    setError("");
    iluminarBoton(async () => {
      setCargando(true);
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            { size: "invisible" }
          );
        }
        const resultado = await signInWithPhoneNumber(
          auth,
          telefono,
          window.recaptchaVerifier
        );
        setConfirmacion(resultado);
        setPaso("otp");
      } catch (err) {
        const codigo = (err as { code?: string }).code ?? "";
        const mensajes: Record<string, string> = {
          "auth/invalid-phone-number": "Número inválido. Revisa el formato.",
          "auth/too-many-requests":
            "Demasiados intentos. Espera unos minutos.",
          "auth/invalid-app-credential":
            "Error de verificación. Recarga la página e intenta de nuevo.",
          "auth/billing-not-enabled": "Error de facturación en Firebase.",
        };
        setError(mensajes[codigo] ?? `Error: ${codigo || "desconocido"}`);
        try {
          window.recaptchaVerifier?.clear();
        } catch (_) {
          /* ignorar */
        }
        window.recaptchaVerifier = undefined;
        // En mobile, reanudar el barrido automático
        if (!esDesktopRef.current) construirBarrido();
      } finally {
        setCargando(false);
      }
    });
  }, [telefono, iluminarBoton, construirBarrido]);

  const verificarOTP = useCallback(() => {
    if (!confirmacion || otp.length < 6) return;
    setError("");
    iluminarBoton(async () => {
      setCargando(true);
      try {
        const credencial = await confirmacion.confirm(otp);
        const familiaDoc = await getDoc(
          doc(db, "familias", credencial.user.uid)
        );
        router.replace(familiaDoc.exists() ? "/dashboard" : "/onboarding");
      } catch (err) {
        const codigo = (err as { code?: string }).code ?? "";
        setError(
          codigo === "auth/invalid-verification-code"
            ? "Código incorrecto."
            : `Error: ${codigo || "desconocido"}`
        );
        if (!esDesktopRef.current) construirBarrido();
      } finally {
        setCargando(false);
      }
    });
  }, [confirmacion, otp, router, iluminarBoton, construirBarrido]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05091a]">
      {/* ── Escena SVG — faro, estrellas, océano, haz ── */}
      <svg
        ref={svgRef}
        viewBox="0 0 400 240"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#010206" />
            <stop offset="100%" stopColor="#06091c" />
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1945" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="beamCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8D060" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#F5C030" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F5C030" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beamSoft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8D060" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reflejo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8D060" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0" />
          </linearGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter
            id="glowFilter"
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cielo */}
        <rect width="400" height="240" fill="url(#skyGrad)" />

        {/* Nebulosas */}
        <ellipse cx="240" cy="70" rx="200" ry="75" fill="#07103a" opacity="0.5" />
        <ellipse cx="90" cy="40" rx="120" ry="50" fill="#060e2e" opacity="0.4" />
        <ellipse cx="350" cy="50" rx="90" ry="40" fill="#060c28" opacity="0.35" />

        {/* Estrellas */}
        <g ref={starGroupRef}>
          {STARS.map(([xPct, yPct, r, opacity], i) => (
            <circle
              key={i}
              cx={(xPct / 100) * 400}
              cy={(yPct / 100) * 170}
              r={r}
              fill="white"
              opacity={opacity}
            />
          ))}
        </g>

        {/* Haz de luz */}
        <g ref={beamRef}>
          <polygon
            points="52,136 490,45 490,227"
            fill="url(#beamSoft)"
            filter="url(#softBlur)"
          />
          <polygon points="52,136 490,88 490,184" fill="url(#beamCore)" />
        </g>

        {/* Reflejo del haz en el océano */}
        <polygon
          points="52,180 490,172 490,190"
          fill="url(#reflejo)"
          opacity="0.4"
        />

        {/* Océano */}
        <path
          d="M0,175 C55,170 110,180 170,174 C230,168 290,182 350,176 C375,173 400,175 400,175 L400,240 L0,240 Z"
          fill="url(#oceanGrad)"
        />

        {/* Ola 1 */}
        <path
          ref={wave1Ref}
          d="M0,179 C65,175 130,184 195,178 C260,172 325,185 400,179"
          stroke="rgba(80,130,220,0.22)"
          strokeWidth="0.7"
          fill="none"
        />
        {/* Ola 2 */}
        <path
          ref={wave2Ref}
          d="M0,186 C80,182 160,192 240,186 C310,180 365,192 400,186"
          stroke="rgba(80,130,220,0.13)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Faro */}
        <g>
          <ellipse cx="52" cy="232" rx="24" ry="7" fill="#0a0e22" />
          <path d="M32,215 C32,208 72,208 72,215 L76,232 L28,232 Z" fill="#0d1128" />
          <rect x="31" y="212" width="42" height="5" rx="1.5" fill="#1e1e3a" />
          <rect x="44" y="153" width="16" height="62" rx="2" fill="#cdb88e" />
          <rect x="46" y="153" width="12" height="62" rx="1" fill="#dcc9a2" />
          <rect x="44" y="165" width="16" height="4" rx="0.8" fill="#a07848" opacity="0.8" />
          <rect x="44" y="180" width="16" height="4" rx="0.8" fill="#a07848" opacity="0.8" />
          <rect x="44" y="195" width="16" height="4" rx="0.8" fill="#a07848" opacity="0.8" />
          <rect x="40" y="149" width="24" height="5" rx="1" fill="#8b6914" />
          <rect x="41" y="148" width="22" height="2" rx="0.5" fill="#c4a030" />
          <rect x="41" y="133" width="22" height="17" rx="2" fill="#141c40" />
          <rect x="43" y="135" width="8" height="13" rx="0.8" fill="#2040a0" opacity="0.65" />
          <rect x="53" y="135" width="8" height="13" rx="0.8" fill="#2040a0" opacity="0.65" />
          <rect x="45" y="137" width="14" height="9" rx="0.5" fill="#FFFBC0" />
          <circle
            ref={glowRef}
            cx="52"
            cy="136"
            r="9"
            fill="#FFF8A0"
            opacity="0.85"
            filter="url(#glowFilter)"
          />
          <path d="M38,133 L52,118 L66,133 Z" fill="#8b6914" />
          <path d="M41,133 L52,120 L63,133 Z" fill="#c4a030" />
          <line x1="52" y1="118" x2="52" y2="110" stroke="#888" strokeWidth="0.7" />
          <circle cx="52" cy="110" r="0.8" fill="#aaa" />
        </g>
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(5,9,26,0.55) 100%)",
        }}
      />
      {/* Gradiente inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(5,9,26,0.85) 0%, transparent 100%)",
        }}
      />

      {/* ── Contenido HTML ── */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Badge */}
        <div className="flex justify-center pt-8 sm:pt-10">
          <div
            ref={badgeRef}
            style={{ opacity: 0 }}
            className="text-amber-300/60 text-[10px] sm:text-xs tracking-[0.28em] uppercase font-medium px-4 py-1.5 rounded-full border border-amber-300/20 backdrop-blur-sm"
          >
            Casa Ronald McDonald · México
          </div>
        </div>

        {/* Título */}
        <div
          ref={titleRef}
          style={{ opacity: 0 }}
          className="text-center mt-6 sm:mt-8"
        >
          <h1 className="text-white font-bold tracking-tight leading-none text-5xl sm:text-6xl md:text-7xl">
            mc<span className="text-amber-300">Faro</span>
          </h1>
          <p className="text-blue-100/50 text-sm sm:text-base mt-2 font-light">
            Tu guía en Casa Ronald McDonald
          </p>
        </div>

        {/* Formulario con efecto glass */}
        <div className="flex-1 flex items-center justify-center px-5 py-6">
          <div
            ref={formRef}
            style={{ opacity: 0 }}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
          >
            {paso === "telefono" ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-blue-100/80 mb-2">
                    Número de teléfono
                  </label>
                  <PhoneInput
                    value={telefono}
                    onChange={setTelefono}
                    disabled={cargando}
                  />
                  <p className="text-xs text-blue-200/30 mt-2">
                    Incluye el código de país (+52 para México)
                  </p>
                  <p className="text-xs text-amber-300/50 mt-0.5">
                    Número de prueba: +52 55 5555 0001
                  </p>
                </div>

                {error && (
                  <p className="text-amber-200 text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  ref={btnRef}
                  onClick={enviarOTP}
                  disabled={cargando || telefono.length < 10}
                  className="w-full bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#3A1F0D] font-bold rounded-2xl py-4 text-base min-h-14 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(248,208,80,0.15), 0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  {cargando ? "Enviando código…" : "Continuar →"}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-4 flex gap-3">
                  <Shield
                    className="text-emerald-400 shrink-0 mt-0.5"
                    size={18}
                  />
                  <p className="text-sm text-emerald-200/90">
                    Enviamos un código a{" "}
                    <span className="font-semibold text-emerald-100">
                      {telefono}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100/80 mb-2">
                    Código de verificación
                  </label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="123456"
                    className="w-full border border-white/15 bg-white/[0.06] rounded-2xl px-4 py-4 text-xl tracking-[0.5em] text-center text-white outline-none focus:ring-2 focus:ring-amber-400/60 placeholder:text-white/20"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>

                {error && (
                  <p className="text-amber-200 text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  ref={btnRef}
                  onClick={verificarOTP}
                  disabled={cargando || otp.length < 6}
                  className="w-full bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#3A1F0D] font-bold rounded-2xl py-4 text-base min-h-14 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(248,208,80,0.15), 0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  {cargando ? "Verificando…" : "Entrar →"}
                </button>

                <button
                  onClick={() => {
                    setPaso("telefono");
                    setError("");
                    setOtp("");
                  }}
                  className="w-full text-blue-200/40 hover:text-blue-200/70 py-3 text-sm transition-colors"
                >
                  ← Cambiar número
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Texto inferior */}
        <p className="text-blue-200/20 text-[11px] text-center pb-6">
          Organiza tus citas · Tu bienestar importa
        </p>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}
