"use client";
import { EmployeeData } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SheetContentUI,
  SheetHeaderUI,
  SheetTitleUI,
  SheetTriggerUI,
  SheetUI,
} from "@/components/ui/SheetUI";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ambulance, ClipboardText, UserCircle, GraduationCap, House, TShirt, PencilSimple } from "@phosphor-icons/react";
import Image from "next/image";
import { useMemo } from "react";
import useSWR from "swr";
import FormUpdateAcademyLevel from "./updateInfo/forms/form-academic_training";
import FormUpdateBackground from "./updateInfo/forms/form-background";
import FormUpdateDwelling from "./updateInfo/forms/form-dwelling";
import FormUpdateHealth from "./updateInfo/forms/form-health_profile";
import FormUpdatePhysical from "./updateInfo/forms/form-physical_profile";
import { FormBasicUpdateInfo } from "./updateInfo/forms/form-basic-info";
import { formatInTimeZone } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { imageProfileFn } from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right break-words min-w-0">{value}</span>
    </div>
  );
}

interface Props {
  employee: EmployeeData;
}

export default function DetailInfoEmployee({ employee }: Props) {
  const { data: profileBlob } = useSWR(
    employee.cedulaidentidad ? ["profile", employee.cedulaidentidad] : null,
    () => imageProfileFn(employee.cedulaidentidad),
  );
  const imageUrl = useMemo(() => {
    if (!profileBlob) return "/bg.png";
    return URL.createObjectURL(profileBlob);
  }, [profileBlob]);

  return (
    <SheetUI>
      <SheetTriggerUI className="w-full" asChild>
        <Button variant="default" size="sm" className="w-full">
          Ver Detalles
        </Button>
      </SheetTriggerUI>
      <SheetContentUI className="w-400">
        <ScrollArea className="flex-1 min-h-0">
          <SheetHeaderUI>
            <SheetTitleUI>Informacion Detallada Del Trabajador</SheetTitleUI>
          </SheetHeaderUI>

          <div className="flex flex-col gap-5 px-3 pt-4 pb-8">

            {/* PROFILE HEADER */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative size-28 rounded-full ring-2 ring-border overflow-hidden bg-muted">
                <Image
                  height={200}
                  width={200}
                  alt="Foto de perfil"
                  src={imageUrl}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground">
                  {employee.nombres} {employee.apellidos}
                </h2>
                <p className="text-xs text-muted-foreground">
                  CI: {employee.cedulaidentidad}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <PencilSimple className="size-3.5" weight="bold" />
                    Actualizar Informacion Basica
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <FormBasicUpdateInfo
                    idEmployee={employee.id.toString()}
                    cedulaidentidad={employee.cedulaidentidad}
                    defaultValues={{
                      apellidos: employee.apellidos,
                      estadoCivil: employee.estadoCivil.id,
                      fecha_nacimiento: new Date(employee.fecha_nacimiento),
                      n_contrato: employee.n_contrato,
                      nombres: employee.nombres,
                      sexoid: employee.sexo.id,
                      file: undefined,
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Separator />

            {/* CARGO DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserCircle className="size-4" weight="bold" />
                {employee.asignaciones.length > 1 ? "Cargos Asignados" : "Cargo Actual"}
              </div>
              <ScrollArea className="max-h-72">
                <div className="space-y-4">
                  {employee.asignaciones.map((v, i) => (
                    <div key={i} className="border-l-[3px] border-primary pl-4 space-y-1">
                      <DataRow label="Codigo" value={v.codigo} />
                      <DataRow label="Cargo" value={v.denominacioncargo.cargo} />
                      <DataRow label="Cargo Especifico" value={v.denominacioncargoespecifico.cargo} />
                      <DataRow label="Tipo de Nomina" value={v.tiponomina.nomina} />
                      <DataRow label="Direccion General" value={v.DireccionGeneral ? v.DireccionGeneral.direccion_general : "N/A"} />
                      <DataRow label="Organismo Adscrito" value={v.OrganismoAdscrito ? v.OrganismoAdscrito.Organismoadscrito : "N/A"} />
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-muted-foreground">Estatus</span>
                        <Badge variant={v.estatusid.estatus === "ACTIVO" ? "default" : "destructive"}>
                          {v.estatusid.estatus}
                        </Badge>
                      </div>
                      {i < employee.asignaciones.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* ANTECEDENTES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ClipboardText className="size-4" weight="bold" />
                  Antecedentes APN
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {employee.antecedentes.length > 0 ? "Agregar" : "Agregar Antecedentes"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FormUpdateBackground
                      idEmployee={employee.id.toString()}
                      defaultValues={{
                        fechaingresoorganismo: new Date(employee.fechaingresoorganismo),
                        antecedentes: employee.antecedentes?.map((ant) => ({
                          institucion: ant.institucion ?? undefined,
                          fecha_ingreso: ant.fecha_ingreso ? new Date(ant.fecha_ingreso) : undefined,
                          fecha_egreso: ant.fecha_egreso ? new Date(ant.fecha_egreso) : undefined,
                        })) ?? [],
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {employee.antecedentes.length > 0 ? (
                <Table>
                  <TableCaption>Lista de antecedentes en la APN.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[110px]">F. Ingreso</TableHead>
                      <TableHead className="w-[110px]">F. Egreso</TableHead>
                      <TableHead>Institucion / Ente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.antecedentes.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {v.fecha_ingreso ? formatInTimeZone(new Date(v.fecha_ingreso), "UTC", "dd/MM/yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          {v.fecha_egreso ? formatInTimeZone(new Date(v.fecha_egreso), "UTC", "dd/MM/yyyy") : "Presente"}
                        </TableCell>
                        <TableCell className="truncate max-w-[180px]">{v.institucion}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Total anos: {employee.anos_apn}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">Sin antecedentes registrados.</p>
              )}
            </div>

            <Separator />

            {/* VIVIENDA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <House className="size-4" weight="bold" />
                  Vivienda
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Editar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FormUpdateDwelling idEmployee={employee.id.toString()} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-1">
                <DataRow label="Estado" value={employee.datos_vivienda?.estado?.estado ?? "N/A"} />
                <DataRow label="Municipio" value={employee.datos_vivienda?.municipio?.municipio ?? "N/A"} />
                <DataRow label="Parroquia" value={employee.datos_vivienda?.parroquia?.parroquia ?? "N/A"} />
                <DataRow label="Condicion" value={employee.datos_vivienda?.condicion?.condicion ?? "N/A"} />
                <DataRow label="Direccion" value={employee.datos_vivienda?.direccion_exacta ?? "N/A"} />
              </div>
            </div>

            <Separator />

            {/* FORMACION ACADEMICA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <GraduationCap className="size-4" weight="bold" />
                  Formacion Academica
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Editar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FormUpdateAcademyLevel
                      idEmployee={employee.id.toString()}
                      defaultValues={{ formacion_academica: employee.formacion_academica }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-1">
                <DataRow label="Nivel Academico" value={employee.formacion_academica?.nivelAcademico?.nivelacademico ?? "N/A"} />
                <DataRow label="Carrera" value={employee.formacion_academica?.carrera?.nombre_carrera ?? "N/A"} />
                <DataRow label="Mencion" value={employee.formacion_academica?.mension?.nombre_mencion ?? "N/A"} />
                <DataRow label="Institucion" value={employee.formacion_academica?.institucion ?? "N/A"} />
                <DataRow label="Capacitacion" value={employee.formacion_academica?.capacitacion ?? "N/A"} />
              </div>
            </div>

            <Separator />

            {/* PERFIL FISICO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TShirt className="size-4" weight="bold" />
                  Vestimenta
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Editar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FormUpdatePhysical
                      idEmployee={employee.id.toString()}
                      defaultValues={{
                        perfil_fisico: {
                          tallaCamisa: Number(employee.perfil_fisico?.tallaCamisa) ?? 0,
                          tallaPantalon: Number(employee.perfil_fisico?.tallaPantalon) ?? 0,
                          tallaZapatos: Number(employee.perfil_fisico?.tallaZapatos) ?? 0,
                        },
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-1">
                <DataRow label="Talla de Camisa" value={employee.perfil_fisico?.tallaCamisa?.talla ?? "N/A"} />
                <DataRow label="Talla de Pantalon" value={employee.perfil_fisico?.tallaPantalon?.talla ?? "N/A"} />
                <DataRow label="Talla de Calzado" value={employee.perfil_fisico?.tallaZapatos?.talla ?? "N/A"} />
              </div>
            </div>

            <Separator />

            {/* PERFIL DE SALUD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Ambulance className="size-4" weight="bold" />
                  Salud
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Editar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FormUpdateHealth
                      idEmployee={employee.id.toString()}
                      defaultValues={{
                        perfil_salud: {
                          grupoSanguineo: Number(employee.perfil_salud?.grupoSanguineo?.id ?? employee.perfil_salud?.grupoSanguineo),
                          patologiaCronica: employee.perfil_salud?.patologiasCronicas?.map((p) => p.id) ?? [],
                          discapacidad: employee.perfil_salud?.discapacidad?.map((d) => d.id) ?? [],
                          alergias: employee.perfil_salud?.alergias?.map((d) => d.id) ?? [],
                        },
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-1">
                <DataRow label="Tipo de Sangre" value={employee.perfil_salud?.grupoSanguineo != null ? employee.perfil_salud.grupoSanguineo.grupoSanguineo : "N/A"} />
              </div>

              {employee.perfil_salud?.patologiasCronicas && employee.perfil_salud.patologiasCronicas.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-foreground mb-1.5">Patologias Cronicas</p>
                  <Table>
                    <TableCaption>Lista de patologias del trabajador</TableCaption>
                    <TableHeader>
                      <TableRow><TableHead>Categoria</TableHead><TableHead>Patologia</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.perfil_salud.patologiasCronicas.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{v.categoria.nombre_categoria}</TableCell>
                          <TableCell>{v.patologia}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {employee.perfil_salud?.discapacidad && employee.perfil_salud.discapacidad.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-foreground mb-1.5">Discapacidades</p>
                  <Table>
                    <TableCaption>Lista de discapacidades del trabajador</TableCaption>
                    <TableHeader>
                      <TableRow><TableHead>Categoria</TableHead><TableHead>Discapacidad</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.perfil_salud.discapacidad.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{v.categoria.nombre_categoria}</TableCell>
                          <TableCell>{v.discapacidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {employee.perfil_salud?.alergias && employee.perfil_salud.alergias.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-foreground mb-1.5">Alergias</p>
                  <Table>
                    <TableCaption>Lista de alergias del trabajador</TableCaption>
                    <TableHeader>
                      <TableRow><TableHead>Categoria</TableHead><TableHead>Alergia</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.perfil_salud.alergias.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{v.categoria.nombre_categoria}</TableCell>
                          <TableCell>{v.alergia}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContentUI>
    </SheetUI>
  );
}
