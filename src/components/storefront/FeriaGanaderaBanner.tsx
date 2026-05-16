"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";

gsap.registerPlugin(useGSAP);

const CARDS = [
  {
    src: "/colecciones/feria-ganadera/fg-11.jpg",
    alt: "Baby Tee Cordobesa — Feria Ganadera",
    label: "Cordobesa",
    sub: "Baby Tee · Negra",
  },
  {
    src: "/colecciones/feria-ganadera/fg-09.jpg",
    alt: "Camiseta Montería Oversize — Feria Ganadera",
    label: "Montería",
    sub: "Oversize · Blanca",
  },
  {
    src: "/colecciones/feria-ganadera/fg-12.jpg",
    alt: "Camiseta Montería Stamp — Feria Ganadera",
    label: "Montería",
    sub: "Stamp · Edición postal",
  },
];

export function FeriaGanaderaBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = [leftRef.current, centerRef.current, rightRef.current];

      // ── Posición inicial (fuera de pantalla abajo, invisible)
      gsap.set(cards, { opacity: 0, y: 180, scale: 0.92 });
      gsap.set([labelRef.current, textRef.current, ctaRef.current], {
        opacity: 0,
        y: 24,
      });

      // ── Timeline de entrada
      const tl = gsap.timeline({ delay: 0.2 });

      // Centro primero, después los laterales
      tl.to(centerRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: "expo.out",
      })
        .to(
          leftRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "expo.out" },
          "-=0.75"
        )
        .to(
          rightRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "expo.out" },
          "-=0.9"
        )
        // Texto en secuencia
        .to(
          labelRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .to(
          textRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .to(
          ctaRef.current,
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
          "-=0.35"
        );

      // ── Flotación continua — cada tarjeta con ritmo diferente
      gsap.to(leftRef.current, {
        y: "+=16",
        duration: 3.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.2,
      });
      gsap.to(centerRef.current, {
        y: "+=22",
        duration: 4.0,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0,
      });
      gsap.to(rightRef.current, {
        y: "+=14",
        duration: 3.7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5,
      });

      // ── Respiro lento en la tarjeta central (rotateY ±3°)
      gsap.to(centerRef.current, {
        rotateY: "+=3",
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // ── Brillo sutil en el fondo cada ~8s
      gsap.to(".feria-bg-glow", {
        opacity: 0.18,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        repeatDelay: 3,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#080808]"
      style={{ minHeight: "100svh", perspective: "1400px" }}
    >
      {/* ── Fondo: gradiente radial cálido */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12090a] via-[#0c0c0c] to-[#080808]" />

      {/* ── Glow dinámico (animado con GSAP) */}
      <div
        className="feria-bg-glow absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, #b8550030 0%, transparent 70%)",
        }}
      />

      {/* ── Glow dorado estático debajo de las tarjetas */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "40%",
          background:
            "radial-gradient(ellipse at center, rgba(240,196,25,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Escena 3D */}
      <div
        className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4 py-20"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Etiqueta colección */}
        <span
          ref={labelRef}
          className="block text-[10px] tracking-[0.45em] uppercase text-[#f0c419] mb-10 font-[600]"
        >
          Feria Ganadera · Montería 2026
        </span>

        {/* ── Tarjetas */}
        <div
          className="relative flex items-center justify-center w-full max-w-5xl"
          style={{ transformStyle: "preserve-3d", height: "clamp(380px, 60vh, 560px)" }}
        >
          {/* TARJETA IZQUIERDA */}
          <div
            ref={leftRef}
            className="absolute"
            style={{
              left: "clamp(0px, 2%, 40px)",
              top: "50%",
              transformStyle: "preserve-3d",
              transform: "translateY(-50%) rotateY(-42deg) translateZ(-120px) scale(0.78)",
              transformOrigin: "right center",
              width: "clamp(180px, 22vw, 260px)",
              zIndex: 1,
            }}
          >
            <Card card={CARDS[0]} />
          </div>

          {/* TARJETA CENTRAL */}
          <div
            ref={centerRef}
            style={{
              transformStyle: "preserve-3d",
              width: "clamp(240px, 28vw, 340px)",
              zIndex: 10,
              position: "relative",
            }}
          >
            <Card card={CARDS[1]} featured />
          </div>

          {/* TARJETA DERECHA */}
          <div
            ref={rightRef}
            className="absolute"
            style={{
              right: "clamp(0px, 2%, 40px)",
              top: "50%",
              transformStyle: "preserve-3d",
              transform: "translateY(-50%) rotateY(42deg) translateZ(-120px) scale(0.78)",
              transformOrigin: "left center",
              width: "clamp(180px, 22vw, 260px)",
              zIndex: 1,
            }}
          >
            <Card card={CARDS[2]} />
          </div>
        </div>

        {/* ── Texto inferior */}
        <div ref={textRef} className="mt-14 text-center">
          <h2
            className="text-[clamp(2.2rem,5vw,4rem)] text-white leading-none"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            La colección del año
          </h2>
          <p className="text-sm text-white/40 mt-3 tracking-wide">
            Diseños exclusivos para la feria más grande de la Costa Caribe
          </p>
        </div>

        {/* ── CTA */}
        <div ref={ctaRef} className="mt-8 flex gap-4">
          <Link
            href="/catalogo?coleccion=feria-ganadera"
            className="inline-block px-8 py-3.5 bg-[#f0c419] text-[#0e0e0e] text-[11px] tracking-[0.25em] uppercase font-[700] hover:bg-white transition-colors"
          >
            Ver colección →
          </Link>
          <Link
            href="/cotiza"
            className="inline-block px-8 py-3.5 border border-white/20 text-white/70 text-[11px] tracking-[0.25em] uppercase font-[500] hover:border-white/60 hover:text-white transition-colors"
          >
            Personalizar
          </Link>
        </div>
      </div>

      {/* ── Degradado inferior que conecta con el resto del home */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F3EDE0] to-transparent pointer-events-none z-20" />
    </section>
  );
}

// ── Sub-componente: tarjeta individual
function Card({
  card,
  featured,
}: {
  card: (typeof CARDS)[number];
  featured?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: "3/4",
        boxShadow: featured
          ? "0 50px 100px rgba(0,0,0,0.85), 0 0 60px rgba(240,196,25,0.12), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 24px 60px rgba(0,0,0,0.7)",
        filter: featured ? "none" : "brightness(0.6) saturate(0.85)",
      }}
    >
      <Image
        src={card.src}
        alt={card.alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 80vw, 340px"
        priority={featured}
      />

      {/* Degradado interno */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Label interno — solo en tarjeta featured */}
      {featured && (
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#f0c419] mb-1 font-[600]">
            {card.sub}
          </p>
          <p
            className="text-lg text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {card.label}
          </p>
        </div>
      )}

      {/* Borde sutil */}
      {featured && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        />
      )}
    </div>
  );
}
