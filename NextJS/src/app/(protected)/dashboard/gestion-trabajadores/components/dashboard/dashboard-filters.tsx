"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eraser, MagnifyingGlass } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import z from "zod";

import {
  getCoordination,
  getDependency,
  getDirectionGeneralById,
  getDirectionLine,
  getNominaGeneral,
} from "../../api/getInfoRac";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schemaFilter = z.object({
  dependencia_id: z.coerce.number().optional(),
  direccion_general_id: z.coerce.number().optional(),
  direccion_linea_id: z.coerce.number().optional(),
  coordinacion_id: z.coerce.number().optional(),
  nomina_id: z.coerce.number().optional(),
});

export type DashboardFilterValues = z.infer<typeof schemaFilter>;

interface DashboardFiltersProps {
  onFilterChange: (filters: Record<string, string | number | null>) => void;
}

export function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const { data: session } = useSession();
  const [dependencyId, setDependencyId] = useState<number>(0);
  const [directionGeneralId, setDirectionGeneralId] = useState<string | null>(null);
  const [directionLineId, setDirectionLineId] = useState<string | null>(null);

  const form = useForm<DashboardFilterValues>({
    defaultValues: {
      dependencia_id: undefined,
      direccion_general_id: undefined,
      direccion_linea_id: undefined,
      coordinacion_id: undefined,
      nomina_id: undefined,
    },
    resolver: zodResolver(schemaFilter),
  });

  const { data: dependency, isLoading: isLoadingDependency } = useSWR(
    "dependency",
    async () => await getDependency(),
  );
  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } = useSWR(
    dependencyId ? ["directionGeneral", dependencyId] : null,
    async () => await getDirectionGeneralById(dependencyId),
  );
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    directionGeneralId ? ["directionLine", directionGeneralId] : null,
    async () => await getDirectionLine(directionGeneralId!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    directionLineId ? ["coordination", directionLineId] : null,
    async () => await getCoordination(directionLineId!),
  );
  const { data: nomina, isLoading: isLoadingNomina } = useSWR(
    "nominaGeneral",
    async () => await getNominaGeneral(),
  );

  const onSubmit = (values: DashboardFilterValues) => {
    const isNotAdmin = session?.user?.role.nombre_rol !== "ADMINISTRADOR";
    const payload: Record<string, string | number | null> = {};
    payload.dependencia_id = isNotAdmin
      ? Number(session?.user.dependency?.id)
      : (values.dependencia_id ?? null);
    payload.direccion_general_id = isNotAdmin
      ? Number(session?.user.directionGeneral?.id)
      : (values.direccion_general_id ?? null);
    payload.direccion_linea_id = isNotAdmin
      ? Number(session?.user.direccionLine?.id) || null
      : (values.direccion_linea_id ?? null);
    payload.coordinacion_id = isNotAdmin
      ? Number(session?.user.coordination?.id) || null
      : (values.coordinacion_id ?? null);
    payload.nomina_id = values.nomina_id ?? null;

    const filtered: Record<string, string | number | null> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v !== null && v !== undefined && v !== "") {
        filtered[k] = v;
      }
    }
    onFilterChange(filtered);
  };

  const cleanFields = () => {
    form.reset({
      dependencia_id: undefined,
      direccion_general_id: undefined,
      direccion_linea_id: undefined,
      coordinacion_id: undefined,
      nomina_id: undefined,
    });
    setDependencyId(0);
    setDirectionGeneralId(null);
    setDirectionLineId(null);
    onFilterChange({});
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-row flex-wrap items-end gap-3 w-full"
      >
        <FormField
          control={form.control}
          name="dependencia_id"
          render={({ field }) => (
            <FormItem className="min-w-[180px] flex-1">
              <FormLabel>Dependencia</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  setDependencyId(Number(val));
                  setDirectionGeneralId(null);
                  setDirectionLineId(null);
                  form.setValue("direccion_general_id", undefined);
                  form.setValue("direccion_linea_id", undefined);
                  form.setValue("coordinacion_id", undefined);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue
                      placeholder={
                        isLoadingDependency
                          ? "Cargando..."
                          : "Seleccione Dependencia"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dependency?.data.map((d, i) => (
                    <SelectItem key={i} value={`${d.id}`}>
                      {d.dependencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion_general_id"
          render={({ field }) => (
            <FormItem className="min-w-[180px] flex-1">
              <FormLabel>Dir. General</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  setDirectionGeneralId(val);
                  setDirectionLineId(null);
                  form.setValue("direccion_linea_id", undefined);
                  form.setValue("coordinacion_id", undefined);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue
                      placeholder={
                        isLoadingDirectionGeneral
                          ? "Cargando..."
                          : "Dirección General"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {directionGeneral?.data.map((d, i) => (
                    <SelectItem key={i} value={`${d.id}`}>
                      {d.direccion_general}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion_linea_id"
          render={({ field }) => (
            <FormItem className="min-w-[180px] flex-1">
              <FormLabel>Dir. Línea</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  setDirectionLineId(val);
                  form.setValue("coordinacion_id", undefined);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue
                      placeholder={
                        isLoadingDirectionLine
                          ? "Cargando..."
                          : "Dirección de Línea"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {directionLine?.data.map((d, i) => (
                    <SelectItem key={i} value={`${d.id}`}>
                      {d.direccion_linea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coordinacion_id"
          render={({ field }) => (
            <FormItem className="min-w-[160px] flex-1">
              <FormLabel>Coordinación</FormLabel>
              <Select onValueChange={(val) => field.onChange(Number(val))}>
                <FormControl>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue
                      placeholder={
                        isLoadingCoordination
                          ? "Cargando..."
                          : "Coordinación"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {coordination?.data.map((d, i) => (
                    <SelectItem key={i} value={`${d.id}`}>
                      {d.coordinacion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nomina_id"
          render={({ field }) => (
            <FormItem className="min-w-[150px] flex-1">
              <FormLabel>Tipo Nómina</FormLabel>
              <Select onValueChange={(val) => field.onChange(Number(val))}>
                <FormControl>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue
                      placeholder={
                        isLoadingNomina ? "Cargando..." : "Tipo de Nómina"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nomina?.data.map((n, i) => (
                    <SelectItem key={i} value={`${n.id}`}>
                      {n.nomina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end gap-2 pb-[1px]">
          <Button
            className="cursor-pointer"
            type="submit"
            size="sm"
          >
            <MagnifyingGlass className="size-4" />
            Aplicar
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer"
            type="button"
            size="sm"
            onClick={cleanFields}
          >
            <Eraser className="size-4" />
            Limpiar
          </Button>
        </div>
      </form>
    </Form>
  );
}
