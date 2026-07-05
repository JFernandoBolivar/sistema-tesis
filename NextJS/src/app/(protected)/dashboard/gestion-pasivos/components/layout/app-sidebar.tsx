"use client";
import { ArrowsLeftRight, Medal, ChartBar, BookOpenText, CaretDown, CaretRight, UserCircle, ChartLine, House, IdentificationCard, List, ListChecks, type Icon, Person, User } from "@phosphor-icons/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "../../../../../../components/ui/skeleton";

type Permission = {
  roleAccept: string[];
  departmentAccept: string[];
};

type MenuItem = {
  title: string;
  url: string;
  icon: Icon;
  permission?: Permission;
  subMenu?: SubMenuItem[];
};

type SubMenuItem = {
  title: string;
  url: string;
  icon: Icon;
  permission?: Permission;
};

const items: MenuItem[] = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: House,
  },
  {
    permission: {
      roleAccept: ["ANALISTA", "ADMINISTRADOR"],
      departmentAccept: ["RAC"],
    },
    title: "Personal Jubilado/Pasivo",
    url: "#",
    icon: User,
    subMenu: [
      {
        title: "Registrar",
        url: "/dashboard/gestion-pasivos/personal-jubilado/registrar",
        icon: Person,
        permission: {
          roleAccept: ["ANALISTA", "ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
      {
        title: "Consultar/Actualizar",
        url: "/dashboard/gestion-pasivos/personal-jubilado/consultar",
        icon: ListChecks,
        permission: {
          roleAccept: ["ANALISTA", "ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
      {
        title: "Agregar Familiar",
        url: "/dashboard/gestion-pasivos/personal-jubilado/familiares/agregar-familiar",
        icon: UserCircle,
        permission: {
          roleAccept: ["ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
      {
        title: "Consultar Familiar",
        url: "/dashboard/gestion-pasivos/personal-jubilado/familiares/consultar",
        icon: BookOpenText,
        permission: {
          roleAccept: ["ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
    ],
  },
  {
    permission: {
      roleAccept: ["ADMINISTRADOR"],
      departmentAccept: ["RAC"],
    },
    title: "Gestión De Codigos",
    url: "#",
    icon: Medal,
    subMenu: [
      {
        title: "Crear Nuevo Código",
        url: "/dashboard/gestion-pasivos/cargos/crear-codigo",
        icon: Medal,
        permission: {
          roleAccept: ["ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
      {
        title: "Consultar/Actualizar",
        url: "/dashboard/gestion-pasivos/cargos/listado-codigo",
        icon: List,
        permission: {
          roleAccept: ["ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
    ],
  },
  {
    permission: {
      roleAccept: ["ADMINISTRADOR"],
      departmentAccept: ["RAC"],
    },
    title: "Movimientos",
    url: "#",
    icon: ArrowsLeftRight,
    subMenu: [
      {
        title: "Cambiar Estatus",
        url: "/dashboard/gestion-pasivos/movimientos/cambiar-estatus",
        icon: ChartLine,
        permission: {
          roleAccept: ["ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
      {
        title: "Egresar",
        url: "/dashboard/gestion-pasivos/movimientos/cambiar-pasivo",
        icon: BookOpenText,
        permission: {
          roleAccept: ["ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
    ],
  },
  {
    permission: {
      roleAccept: ["ANALISTA", "ADMINISTRADOR"],
      departmentAccept: ["RAC"],
    },
    icon: ChartBar,
    title: "Reportes",
    url: "#",
    subMenu: [
      {
        title: "Personal Pasivos",
        url: "/dashboard/gestion-pasivos/reportes/pasivos",
        icon: IdentificationCard,
        permission: {
          roleAccept: ["ANALISTA", "ADMINISTRADOR"],
          departmentAccept: ["RAC"],
        },
      },
    ],
  },
];

export function AppSidebarPasivos() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };
  const { data: session } = useSession();

  const checkPermission = (item: MenuItem | SubMenuItem): boolean => {
    if (!item.permission) return true;

    const hasRolePermission = item.permission.roleAccept.includes(
      session?.user.role.nombre_rol || "",
    );

    const hasDepartmentPermission = item.permission.departmentAccept.includes(
      session?.user.department.nombre_departamento || "",
    );

    return hasRolePermission && hasDepartmentPermission;
  };

  const filteredItems = items
    .filter((item) => {
      if (!checkPermission(item)) return false;
      if (!item.subMenu) return true;
      const filteredSubMenu = item.subMenu.filter((subItem) => {
        return checkPermission(subItem);
      });
      return filteredSubMenu.length > 0;
    })
    .map((item) => {
      if (item.subMenu) {
        const filteredSubMenu = item.subMenu.filter((subItem) =>
          checkPermission(subItem),
        );
        return {
          ...item,
          subMenu: filteredSubMenu,
        };
      }
      return item;
    });

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="w-full h-fit">
            <Image
              src="/logoOAC.png"
              alt="Logo 1"
              width={150}
              height={98}
              className="h-full w-full object-cover rounded-2xl"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {!session ? (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <Skeleton className="w-full p-2 bg-gray-200 animate-pulse mt-3" />
                  </SidebarMenuItem>
                ))}
              </>
            ) : (
              <SidebarMenu>
                {filteredItems.map((item) => (
                  <SidebarMenuItem key={item.title} className={"mt-5"}>
                    {item.subMenu ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => toggleSubmenu(item.title)}
                          className="text-sm h-fit"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <item.icon className="h-[16px]" />
                              <span className="ml-2 text-sm">{item.title}</span>
                            </div>
                            {openSubmenu === item.title ? (
                              <CaretDown size={20} />
                            ) : (
                              <CaretRight size={20} />
                            )}
                          </div>
                        </SidebarMenuButton>
                        {openSubmenu === item.title && (
                          <div className="pl-8 py-1 space-y-1 text-sm">
                            {item.subMenu.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                asChild
                                className="mt-2 text-sm"
                              >
                                <Link href={subItem.url} className="text-sm">
                                  <subItem.icon className="h-[32px]" />
                                  {subItem.title}
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className="flex items-center text-sm"
                        >
                          <item.icon className="h-[32px]" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          {!session ? (
            <div className="p-2 border-b-3 rounded-2xl flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <Skeleton className="w-full p-2 bg-gray-200 animate-pulse" />
                <Skeleton className="w-full p-2 bg-gray-200 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="w-full p-2 bg-gray-200 animate-pulse" />
                <Skeleton className="w-full p-2 bg-gray-200 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="p-2 border-b-3 rounded-2xl ">
              <div className="flex flex-col">
                <h1 className="font-semibold">{session.user.name}</h1>
                <h2 className="text-sm text-gray-400 font-bold">
                  C.I: {session.user.cedula}
                </h2>
              </div>
              <div className="flex flex-col">
                <h2 className="font-semibold">
                  {/* Rol:{session.user.role?.nombre_rol || "Sin Rol"} */}
                </h2>
                <h1 className="text-sm text-gray-400 font-bold">
                  Departamento:{" "}
                  {/* {session.user.department?.nombre_departamento ||
                    "Sin Departamento"} */}
                </h1>
              </div>
            </div>
          )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
