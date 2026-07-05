"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardFilters } from "./dashboard-filters";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { postDashboardStats } from "../../api/getInfoRac";
import { truncateLabel, generateChartColors } from "@/components/dashboard/chart-config";
import type {
  DashboardDistData,
  DashboardKpiData,
  DashboardRequest,
  DashboardResponse,
} from "@/app/types/types";
import {
  Buildings,
  ChartBar,
  GraduationCap,
  Users,
  UserCheck,
  GenderIntersex,
  TrendUp,
  Briefcase,
} from "@phosphor-icons/react";

function useDashboardStats(
  dimension: DashboardRequest["dimension"],
  filtros: Record<string, string | number | null>,
) {
  const paramsKey = JSON.stringify({ dimension, filtros });
  return useSWR(
    ["dashboard-stats", paramsKey],
    () =>
      postDashboardStats<DashboardRequest>({ dimension, filtros }) as Promise<DashboardResponse>,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    },
  );
}

function transformDistData(data: DashboardResponse | undefined) {
  if (data?.data && data.dimension !== "kpi" && Array.isArray(data.data)) {
    return (data.data as DashboardDistData[]).map((d) => ({
      name: d.label,
      value: d.count,
    }));
  }
  return [];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
};

export function DashboardPage() {
  const [filtros, setFiltros] = useState<Record<string, string | number | null>>({});

  const handleFilterChange = useCallback(
    (newFilters: Record<string, string | number | null>) => {
      setFiltros(newFilters);
    },
    [],
  );

  const { data: kpiData, isLoading: kpiLoading } = useDashboardStats("kpi", filtros);
  const { data: nominaData, isLoading: nominaLoading } = useDashboardStats("nomina", filtros);
  const { data: sexoData, isLoading: sexoLoading } = useDashboardStats("sexo", filtros);
  const { data: depData, isLoading: depLoading } = useDashboardStats("dependencia", filtros);
  const { data: acadData, isLoading: acadLoading } = useDashboardStats("nivel_academico", filtros);
  const { data: tendenciaData, isLoading: tendenciaLoading } = useDashboardStats("ingresos_egresos", filtros);

  const kpi = useMemo(() => {
    if (kpiData?.data && kpiData.dimension === "kpi") {
      return kpiData.data as DashboardKpiData;
    }
    return null;
  }, [kpiData]);

  const nominaDist = useMemo(() => {
    const raw = transformDistData(nominaData);
    return raw.map((d) => ({ ...d, label: truncateLabel(d.name, 22) })).sort((a, b) => b.value - a.value);
  }, [nominaData]);

  const sexoDist = useMemo(() => transformDistData(sexoData), [sexoData]);
  const depDist = useMemo(() => {
    const raw = transformDistData(depData);
    return raw.map((d) => ({ ...d, label: truncateLabel(d.name, 20) }));
  }, [depData]);

  const acadDist = useMemo(() => {
    const raw = transformDistData(acadData);
    return raw.map((d) => ({ ...d, label: truncateLabel(d.name, 25) }));
  }, [acadData]);

  const tendenciaDist = useMemo(() => {
    if (tendenciaData?.data && Array.isArray(tendenciaData.data)) {
      return tendenciaData.data;
    }
    return [];
  }, [tendenciaData]);

  const nominaColors = useMemo(() => generateChartColors(nominaDist.length), [nominaDist.length]);
  const sexoColors = useMemo(() => generateChartColors(sexoDist.length), [sexoDist.length]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/20 bg-card/60 backdrop-blur-sm p-4">
        <DashboardFilters onFilterChange={handleFilterChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Empleados"
          value={kpi?.total ?? "--"}
          description={kpi ? `${kpi.porcentaje_activos}% activos` : undefined}
          icon={Users}
          iconColor="text-chart-1"
          loading={kpiLoading}
        />
        <StatsCard
          title="Activos"
          value={kpi?.activos ?? "--"}
          description={kpi ? `${kpi.ingresos_mes} ingresos este mes` : undefined}
          icon={UserCheck}
          iconColor="text-chart-2"
          loading={kpiLoading}
        />
        <StatsCard
          title="Dependencias"
          value={kpi?.dependencias ?? "--"}
          description={kpi ? `${kpi.egresados_mes} egresos este mes` : undefined}
          icon={Buildings}
          iconColor="text-chart-4"
          loading={kpiLoading}
        />
        <StatsCard
          title="Antigüedad Promedio"
          value={kpi?.antiguedad_promedio ? `${kpi.antiguedad_promedio} años` : "--"}
          icon={ChartBar}
          iconColor="text-chart-5"
          loading={kpiLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución por Tipo de Nómina" icon={Briefcase} loading={nominaLoading} className="h-[420px]">
          {nominaDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={nominaDist} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={110} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)" }} />
                <Bar dataKey="value" name="Empleados" radius={[0, 4, 4, 0]}>
                  {nominaDist.map((_, i) => (
                    <Cell key={i} fill={nominaColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Distribución por Sexo" icon={GenderIntersex} loading={sexoLoading} className="h-[420px]">
          {sexoDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={sexoDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={115}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {sexoDist.map((_, i) => (
                    <Cell key={i} fill={sexoColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Empleados por Dependencia" icon={Buildings} loading={depLoading} className="h-[420px]">
          {depDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={depDist} margin={{ top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} angle={-30} textAnchor="end" height={65} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)" }} />
                <Bar dataKey="value" fill="hsl(237, 70%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Por Nivel Académico" icon={GraduationCap} loading={acadLoading} className="h-[420px]">
          {acadDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={acadDist} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={135} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)" }} />
                <Bar dataKey="value" fill="hsl(160, 70%, 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      <ChartCard title="Tendencia Ingresos / Egresos" icon={TrendUp} loading={tendenciaLoading}>
        {tendenciaDist.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tendenciaDist as { fecha: string; ingresos: number; egresos: number }[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="fecha" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)" }} />
              <Bar dataKey="ingresos" fill="hsl(157, 65%, 52%)" radius={[4, 4, 0, 0]} name="Ingresos" />
              <Bar dataKey="egresos" fill="hsl(10, 65%, 55%)" radius={[4, 4, 0, 0]} name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <ChartBar className="size-8 opacity-30" />
    </div>
  );
}
