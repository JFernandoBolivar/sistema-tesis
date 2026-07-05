"use client";
import { SignOutButton } from "@/components/signout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "./gestion-trabajadores/components/loading/loading";
type Department = {
  id: string;
  name: string;
  imageSrc: string;
  href: string;
  color: string;
  alt: string;
};
const departments: Department[] = [
  {
    id: "Seguridad",
    name: "Seguridad",
    imageSrc: "/images/departments/seguridad.jpg",
    href: "/dashboard/seguridad",
    color: "bg-green-500",
    alt: "Sección de seguridad y privacidad.",
  },
  {
    id: "RAC",
    name: "Gestión de Trabajadores",
    imageSrc: "/images/departments/datos.jpg",
    href: "/dashboard/gestion-trabajadores",
    color: "bg-green-500",
    alt: "Human Resources Department",
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
      toast.success(`Bienvenido ${session.user.name}`, {
        style: {
          color: "white",
        },
      });
      router.push(departmentHref);
    } else {
      toast.warning("No puedes acceder a este modulo", {
        style: {
          color: "white",
        },
      });
    }
  };
  return (
    <>
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      <div className="flex flex-col items-center mb-8 mt-4">
        <h1 className="text-3xl font-bold mb-2 text-foreground text-center">
          Sistema de Informacion Integral
        </h1>
        <p className="text-lg text-center text-muted-foreground">
          Seleccione un modulo para acceder a sus funciones
        </p>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-4 md:mx-8">
        {departments.map((department, index) => {
          const hasAccess =
            session?.user?.department.nombre_departamento === department.id;
          return (
            <Card
              key={index}
              onClick={() =>
                handleDepartmentValidation(department.id, department.href)
              }
              className={`p-0 gap-0 overflow-hidden transition-all duration-300 ${
                hasAccess
                  ? "hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              {!hasAccess && (
                <div className="absolute top-3 right-3 z-10 bg-muted text-muted-foreground p-1.5 rounded-full">
                  <Lock size={16} weight="bold" />
                </div>
              )}

              {hasAccess && (
                <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground p-1.5 rounded-full">
                  <Check size={16} weight="bold" />
                </div>
              )}
              <Image
                height={150}
                width={100}
                src={department.imageSrc}
                alt={department.alt}
                className={`w-full h-60 object-contain ${
                  hasAccess ? "" : "grayscale"
                }`}
              />
              <div className="border-t border-white/10 px-5 py-4 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {department.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasAccess
                    ? "Tienes acceso a este departamento."
                    : "No tiene acceso a este departamento"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
