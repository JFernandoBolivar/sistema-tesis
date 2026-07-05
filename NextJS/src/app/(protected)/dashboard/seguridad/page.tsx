"use client";
import PageLayout from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserPlus, UserList, LockKey, ChartBar } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: Icon;
  gradient: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Registrar Usuario",
    description: "Crear nueva cuenta de acceso al sistema",
    href: "/dashboard/seguridad/gestionar-usuarios/registrar",
    icon: UserPlus,
    gradient: "from-emerald-500/20 to-teal-600/20",
  },
  {
    title: "Modificar Usuario",
    description: "Buscar, editar permisos y gestionar cuentas existentes",
    href: "/dashboard/seguridad/gestionar-usuarios/modificar",
    icon: UserList,
    gradient: "from-amber-500/20 to-orange-600/20",
  },
];

export default function SecurityPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <PageLayout
      title="Gestión de Usuarios y Seguridad"
      description="Administración de accesos, roles y permisos del sistema"
    >
      <div className="space-y-8">
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl">
          <div className="size-14 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg shrink-0">
            <ShieldCheck size={28} weight="bold" className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Bienvenid@, {session?.user.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Rol: {session?.user.role.nombre_rol} · Departamento:{" "}
              {session?.user.department.nombre_departamento}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Acciones rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Card
                key={i}
                onClick={() => router.push(action.href)}
                className="group relative p-5 cursor-pointer hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}
                />
                <div className="relative flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <action.icon
                      size={22}
                      weight="bold"
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {action.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <span className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <LockKey
              size={24}
              weight="bold"
              className="text-slate-400 mx-auto mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Acceso restringido por roles
            </p>
          </Card>
          <Card className="p-4 text-center">
            <ShieldCheck
              size={24}
              weight="bold"
              className="text-green-400 mx-auto mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Credenciales cifradas
            </p>
          </Card>
          <Card className="p-4 text-center">
            <ChartBar
              size={24}
              weight="bold"
              className="text-blue-400 mx-auto mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Auditoría de actividad
            </p>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
