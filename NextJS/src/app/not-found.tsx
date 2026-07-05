"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, House } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "Estamos trabajando en ello";

  useEffect(() => {
    setIsVisible(true);

    // Efecto de escritura para el texto principal
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <Card
        className={`w-full max-w-3xl mx-auto shadow-lg border bg-card overflow-hidden transform transition-all duration-1000 ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-95"
        }`}
      >
        <div className="bg-primary p-4 flex justify-center">
          <div className="transform hover:scale-110 transition-transform duration-500 hover:rotate-3">
            <Image
              src="/images/image.png"
              width={300}
              height={300}
              alt="Logo Reportes"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <h1
              className={`text-4xl font-bold text-foreground transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              Pagina no encontrada
            </h1>

            <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 via-blue-600 to-red-600 mx-auto my-4 animate-gradient-x"></div>

            <p
              className={`text-xl text-muted-foreground font-medium min-h-[28px] transform transition-all duration-1000 delay-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              {typedText}
              <span className="animate-pulse">|</span>
            </p>

            <p
              className={`text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto transform transition-all duration-1000 delay-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              La pagina que esta buscando no se encuentra disponible en este
              momento. Nuestro equipo tecnico esta trabajando para mejorar su
              experiencia.
            </p>
          </div>

          <div
            className={`relative h-48 md:h-64 w-full overflow-hidden rounded-lg shadow-md my-6 group transform transition-all duration-1000 delay-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-primary/70 group-hover:bg-primary/50 transition-all duration-500"></div>
            <div className="absolute bottom-4 left-4 text-primary-foreground text-sm font-medium transform group-hover:translate-x-2 transition-transform duration-300">
              Sede Principal
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-3 pt-4 max-w-md mx-auto transform transition-all duration-1000 delay-1200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            <Button
              asChild
              className="flex-1 transform hover:scale-105 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg"
            >
              <Link href="/">
                <House className="w-4 h-4 mr-2 animate-bounce" />
                Ir al inicio
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 transform hover:scale-105 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Volver atras
            </Button>
          </div>

          <div
            className={`pt-6 text-xs text-muted-foreground border-t border-border mt-6 transform transition-all duration-1000 delay-1400 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            (c) {new Date().getFullYear()} Ministerio del Poder Popular para
            Relaciones Interiores, Justicia y Paz
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
