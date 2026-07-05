from django.db.models import Count, Q, Avg, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter
from collections import defaultdict

from RAC.models.personal_models import (
    Employee, AsigTrabajo, Dependencias,
    Tiponomina, NivelAcademico, Grado,
    formacion_academica,
)


def _apply_filters(qs, filtros):
    if not filtros:
        return qs

    dependencia_id = filtros.get("dependencia_id")
    direccion_general_id = filtros.get("direccion_general_id")
    direccion_linea_id = filtros.get("direccion_linea_id")
    coordinacion_id = filtros.get("coordinacion_id")
    nomina_id = filtros.get("nomina_id")
    grado_id = filtros.get("grado_id")
    sexo_id = filtros.get("sexo_id")
    nivel_academico_id = filtros.get("nivel_academico_id")
    estatus_id = filtros.get("estatus_id")
    organismo_id = filtros.get("OrganismoAdscrito_id")
    cargo_id = filtros.get("cargo_id")
    cargo_especifico_id = filtros.get("cargo_especifico_id")
    edad_min = filtros.get("edad_min")
    edad_max = filtros.get("edad_max")

    if dependencia_id:
        qs = qs.filter(assignments__DireccionGeneral__dependenciaId=dependencia_id)
    if direccion_general_id:
        qs = qs.filter(assignments__DireccionGeneral=direccion_general_id)
    if direccion_linea_id:
        qs = qs.filter(assignments__DireccionLinea=direccion_linea_id)
    if coordinacion_id:
        qs = qs.filter(assignments__Coordinacion=coordinacion_id)
    if nomina_id:
        qs = qs.filter(assignments__tiponominaid=nomina_id)
    if grado_id:
        qs = qs.filter(assignments__gradoid=grado_id)
    if sexo_id:
        qs = qs.filter(sexoid=sexo_id)
    if nivel_academico_id:
        qs = qs.filter(
            Q(formacion_academica__nivel_Academico_id=nivel_academico_id) &
            Q(assignments__isnull=False)
        )
    if estatus_id:
        qs = qs.filter(assignments__estatusid=estatus_id)
    if organismo_id:
        qs = qs.filter(assignments__OrganismoAdscritoid=organismo_id)
    if cargo_id:
        qs = qs.filter(assignments__denominacioncargoid=cargo_id)
    if cargo_especifico_id:
        qs = qs.filter(assignments__denominacioncargoespecificoid=cargo_especifico_id)
    if edad_min is not None:
        from datetime import date
        cutoff_min = date.today().replace(year=date.today().year - int(edad_min))
        qs = qs.filter(fecha_nacimiento__lte=cutoff_min)
    if edad_max is not None:
        from datetime import date
        cutoff_max = date.today().replace(year=date.today().year - int(edad_max))
        qs = qs.filter(fecha_nacimiento__gte=cutoff_max)

    return qs.distinct()


@extend_schema(
    tags=["Dashboard - Estadisticas"],
    summary="Dashboard de estadisticas de personal activo",
    description="Retorna datos agregados segun la dimension solicitada con los filtros aplicados.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "dimension": {
                    "type": "string",
                    "enum": [
                        "kpi", "sexo", "dependencia", "grado",
                        "nivel_academico", "nomina", "ingresos_egresos"
                    ]
                },
                "filtros": {
                    "type": "object",
                    "properties": {
                        "dependencia_id": {"type": "number"},
                        "direccion_general_id": {"type": "number"},
                        "direccion_linea_id": {"type": "number"},
                        "coordinacion_id": {"type": "number"},
                        "nomina_id": {"type": "number"},
                        "grado_id": {"type": "number"},
                        "sexo_id": {"type": "number"},
                        "nivel_academico_id": {"type": "number"},
                        "estatus_id": {"type": "number"},
                        "OrganismoAdscrito_id": {"type": "number"},
                        "cargo_id": {"type": "number"},
                        "cargo_especifico_id": {"type": "number"},
                        "edad_min": {"type": "number"},
                        "edad_max": {"type": "number"},
                    },
                    "additionalProperties": True,
                },
            },
            "required": ["dimension"],
        }
    },
    examples=[
        OpenApiExample(
            "KPI Dashboard",
            summary="Obtener KPIs del dashboard",
            value={"dimension": "kpi", "filtros": {}},
        ),
        OpenApiExample(
            "Distribucion por sexo",
            summary="Distribucion de empleados por sexo",
            value={"dimension": "sexo", "filtros": {"dependencia_id": 1}},
        ),
    ],
)
class DashboardEstadisticasView(APIView):
    def post(self, request):
        try:
            dimension = request.data.get("dimension")
            filtros = request.data.get("filtros", {})

            if not dimension:
                return Response({
                    "status": "Error",
                    "message": "El campo 'dimension' es requerido"
                }, status=status.HTTP_400_BAD_REQUEST)

            if dimension == "kpi":
                data = self._get_kpi(filtros)
            elif dimension == "sexo":
                data = self._get_distribucion_sexo(filtros)
            elif dimension == "dependencia":
                data = self._get_distribucion_dependencia(filtros)
            elif dimension == "grado":
                data = self._get_distribucion_grado(filtros)
            elif dimension == "nivel_academico":
                data = self._get_distribucion_academico(filtros)
            elif dimension == "nomina":
                data = self._get_distribucion_nomina(filtros)
            elif dimension == "ingresos_egresos":
                data = self._get_ingresos_egresos(filtros)
            else:
                return Response({
                    "status": "Error",
                    "message": f"Dimension '{dimension}' no soportada"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "status": "Ok",
                "message": f"Estadisticas de '{dimension}' cargadas correctamente",
                "data": {
                    "dimension": dimension,
                    "data": data,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "Error",
                "message": f"Error al obtener estadisticas: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_employee_qs(self, filtros):
        qs = Employee.objects.filter(
            assignments__isnull=False,
            assignments__Tipo_personal__tipo_personal="ACTIVO",
        )
        return _apply_filters(qs, filtros)

    def _get_kpi(self, filtros):
        employees = self._get_employee_qs(filtros)
        total = employees.distinct().count()

        activos_qs = employees.filter(assignments__estatusid__estatus="ACTIVO")
        activos = activos_qs.distinct().count()

        dependencias_count = Dependencias.objects.filter(
            id__in=employees.values_list("assignments__DireccionGeneral__dependenciaId", flat=True).distinct()
        ).count()

        antiguedad = employees.aggregate(avg=Avg("total_anos_apn"))["avg"] or 0

        porcentaje = round((activos / total * 100), 1) if total > 0 else 0

        hoy = timezone.now().date()
        inicio_mes = hoy.replace(day=1)
        ingresos_mes = Employee.objects.filter(
            fechaingresoorganismo__gte=inicio_mes,
            fechaingresoorganismo__lte=hoy,
            assignments__isnull=False,
        ).count()

        from RAC.models.historial_personal_models import EmployeeEgresado
        egresos_mes = EmployeeEgresado.objects.filter(
            fecha_egreso__date__gte=inicio_mes,
            fecha_egreso__date__lte=hoy,
        ).count()

        return {
            "total": total,
            "activos": activos,
            "dependencias": dependencias_count,
            "antiguedad_promedio": round(float(antiguedad), 1),
            "porcentaje_activos": porcentaje,
            "egresados_mes": egresos_mes,
            "ingresos_mes": ingresos_mes,
        }

    def _get_distribucion_sexo(self, filtros):
        employees = self._get_employee_qs(filtros)
        result = (
            employees.values(sexo=F("sexoid__sexo"))
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return [{"label": r["sexo"], "count": r["count"]} for r in result]

    def _get_distribucion_dependencia(self, filtros):
        employees = self._get_employee_qs(filtros)
        result = (
            employees.values(dep=F("assignments__DireccionGeneral__dependenciaId__dependencia"))
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return [{"label": r["dep"], "count": r["count"]} for r in result if r["dep"]]

    def _get_distribucion_grado(self, filtros):
        employees = self._get_employee_qs(filtros)
        result = (
            employees.values(gr=F("assignments__gradoid__grado"))
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return [{"label": r["gr"], "count": r["count"]} for r in result if r["gr"]]

    def _get_distribucion_academico(self, filtros):
        employees = self._get_employee_qs(filtros)
        result = (
            employees.filter(formacion_academica__isnull=False)
            .values(nivel=F("formacion_academica__nivel_Academico_id__nivelacademico"))
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return [{"label": r["nivel"], "count": r["count"]} for r in result if r["nivel"]]

    def _get_distribucion_nomina(self, filtros):
        employees = self._get_employee_qs(filtros)
        result = (
            employees.values(nom=F("assignments__tiponominaid__nomina"))
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return [{"label": r["nom"], "count": r["count"]} for r in result]

    def _get_ingresos_egresos(self, filtros):
        hoy = timezone.now().date()
        hace_12_meses = hoy - timedelta(days=365)

        ingresos = (
            Employee.objects
            .filter(
                fechaingresoorganismo__gte=hace_12_meses,
                fechaingresoorganismo__lte=hoy,
                assignments__isnull=False,
            )
            .annotate(mes=TruncMonth("fechaingresoorganismo"))
            .values("mes")
            .annotate(count=Count("id"))
            .order_by("mes")
        )

        from RAC.models.historial_personal_models import EmployeeEgresado
        egresos_qs = EmployeeEgresado.objects.filter(
            fecha_egreso__date__gte=hace_12_meses,
            fecha_egreso__date__lte=hoy,
        )

        egresos = (
            egresos_qs
            .annotate(mes=TruncMonth("fecha_egreso"))
            .values("mes")
            .annotate(count=Count("id"))
            .order_by("mes")
        )

        meses = defaultdict(lambda: {"ingresos": 0, "egresos": 0})
        for r in ingresos:
            key = r["mes"].strftime("%Y-%m")
            meses[key]["ingresos"] = r["count"]

        for r in egresos:
            key = r["mes"].strftime("%Y-%m")
            meses[key]["egresos"] = r["count"]

        return [
            {
                "fecha": mes,
                "ingresos": v["ingresos"],
                "egresos": v["egresos"],
                "balance": v["ingresos"] - v["egresos"],
            }
            for mes, v in sorted(meses.items())
        ]
