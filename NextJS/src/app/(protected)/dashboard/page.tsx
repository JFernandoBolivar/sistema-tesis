"use client";
import { SignOutButton } from "@/components/signout-button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Icon } from "@phosphor-icons/react";
import Loading from "./gestion-trabajadores/components/loading/loading";

type Department = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: Icon;
  gradient: string;
  iconBg: string;
};

const departments: Department[] = [
  {
    id: "Seguridad",
    name: "Seguridad",
    description: "Gestión de usuarios, roles y permisos del sistema",
    href: "/dashboard/seguridad",
    icon: ShieldCheck,
    gradient: "from-slate-500/30 to-slate-700/20",
    iconBg: "from-slate-500 to-slate-700",
  },
  {
    id: "RAC",
    name: "Gestión de Trabajadores",
    description: "Personal, dependencias, cargos, movimientos y reportes",
    href: "/dashboard/gestion-trabajadores",
    icon: UsersThree,
    gradient: "from-blue-500/30 to-indigo-600/20",
    iconBg: "from-blue-500 to-indigo-600",
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loading promiseMessage="Cargando Sesion" />;
  }

  const handleDepartmentValidation = (
    departmentId: string,
    departmentHref: string,
  ) => {
    if (session?.user?.department.nombre_departamento == departmentId) {
      toast.success(`Bienvenid@ ${session.user.name}`, {
        style: { color: "white" },
      });
      router.push(departmentHref);
    } else {
      toast.warning("No tienes acceso a este módulo", {
        style: { color: "white" },
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] px-4">
      <div className="text-center mb-10 card-enter">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          Sistema en línea
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
          Sistema de Información Integral
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
          Seleccione un módulo para acceder a sus funciones
        </p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {departments.map((department, index) => {
          const hasAccess =
            session?.user?.department.nombre_departamento === department.id;
          return (
            <div
              key={index}
              onClick={() =>
                handleDepartmentValidation(department.id, department.href)
              }
              style={{ animationDelay: `${0.15 + index * 0.1}s` }}
              className={`card-enter group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
                hasAccess
                  ? "border-white/20 bg-card/70 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer hover:-translate-y-1"
                  : "border-white/10 bg-card/40 opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${department.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="absolute top-4 right-4 z-10">
                {hasAccess ? (
                  <Badge
                    variant="success"
                    className="gap-1.5 pl-2 pr-3 py-1 shadow-lg shadow-green-500/20"
                  >
                    <Check size={14} weight="bold" />
                    Acceso autorizado
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-3 py-1"
                  >
                    <Lock size={14} weight="bold" />
                    Sin permisos
                  </Badge>
                )}
              </div>

              <div className="relative flex flex-col items-center p-8 pt-14 pb-8">
                <div
                  className={`size-20 rounded-2xl bg-gradient-to-br ${department.iconBg} flex items-center justify-center mb-5 shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                    hasAccess ? "" : "grayscale opacity-60"
                  }`}
                >
                  <department.icon
                    size={44}
                    weight="bold"
                    className="text-white"
                  />
                </div>

                <h2 className="text-xl font-bold text-foreground mb-2 text-center">
                  {department.name}
                </h2>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  {department.description}
                </p>

                {hasAccess && (
                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Ingresar al módulo</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
