"use client";
// Stack — componente de cartas apiladas con drag, de reactbits.dev/components/stack
import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
  onClick?: () => void;
}

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false, onClick }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return (
      <motion.div className="absolute inset-0 cursor-pointer" style={{ x: 0, y: 0 }} onClick={onClick}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export interface StackProps {
  cards?: React.ReactNode[];
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
  animationConfig?: { stiffness: number; damping: number };
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
  /** Callback cuando la carta superior se envía al fondo (se "pasa") */
  onCardChange?: (topIndex: number) => void;
}

export interface StackRef {
  next: () => void;
  prev: () => void;
}

const Stack = forwardRef<StackRef, StackProps>(function Stack({
  cards = [],
  randomRotation = false,
  sensitivity = 150,
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = true,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = true,
  mobileBreakpoint = 768,
  onCardChange,
}, ref) {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < mobileBreakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [mobileBreakpoint]);

  const shouldDisableDrag = mobileClickOnly && isMobile;
  const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

  const [stack, setStack] = useState(() =>
    cards.map((content, i) => ({ id: i, content }))
  );

  useEffect(() => {
    setStack(cards.map((content, i) => ({ id: i, content })));
  }, [cards]);

  const sendToBack = (id: number) => {
    setStack((prev) => {
      const next = [...prev];
      const idx = next.findIndex((c) => c.id === id);
      const [card] = next.splice(idx, 1);
      next.unshift(card);
      if (onCardChange) onCardChange(next[next.length - 1].id);
      return next;
    });
  };

  // Métodos expuestos vía ref para flechas externas
  useImperativeHandle(ref, () => ({
    // Siguiente: envía la carta superior al fondo
    next: () => {
      setStack((prev) => {
        if (prev.length <= 1) return prev;
        const next = [...prev];
        const top = next.pop()!;
        next.unshift(top);
        if (onCardChange) onCardChange(next[next.length - 1].id);
        return next;
      });
    },
    // Anterior: trae la carta del fondo arriba
    prev: () => {
      setStack((prev) => {
        if (prev.length <= 1) return prev;
        const next = [...prev];
        const bottom = next.shift()!;
        next.push(bottom);
        if (onCardChange) onCardChange(next[next.length - 1].id);
        return next;
      });
    },
  }), [onCardChange]);

  useEffect(() => {
    if (!autoplay || stack.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      const topId = stack[stack.length - 1].id;
      sendToBack(topId);
    }, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, stack, isPaused]);

  return (
    <div
      className="relative w-full h-full"
      style={{ perspective: 600 }}
      onMouseEnter={() => { if (pauseOnHover) setIsPaused(true); }}
      onMouseLeave={() => { if (pauseOnHover) setIsPaused(false); }}
    >
      {stack.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={shouldDisableDrag}
            onClick={() => shouldEnableClick && sendToBack(card.id)}
          >
            <motion.div
              className="rounded-2xl overflow-hidden w-full h-full"
              animate={{
                rotateZ: (stack.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - stack.length * 0.06,
                transformOrigin: "50% 90%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
});

export default Stack;
