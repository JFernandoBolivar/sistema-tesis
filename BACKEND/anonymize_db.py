import os
import sys
import random
import django
from datetime import date, timedelta
from django.db import connection, transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SIGEP.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from RAC.models.personal_models import (
    Employee, AsigTrabajo, formacion_academica, antecedentes_servicio,
    datos_vivienda, perfil_salud, perfil_fisico, contacto_emergencia,
    GrupoSanguineo, Sexo, estado_civil,
)
from RAC.models.family_personal_models import Employeefamily
from RAC.models.historial_personal_models import EmployeeEgresado

KEEP_CEDULA = "30799436"

NAMES_M = [
    "Jose", "Carlos", "Luis", "Miguel", "Pedro", "Ramon", "Manuel", "Rafael",
    "Antonio", "Francisco", "Alejandro", "Gustavo", "Jorge", "Oscar", "Enrique",
    "Alberto", "Fernando", "Ricardo", "Hector", "Eduardo", "Daniel", "Gabriel",
    "Andres", "Victor", "Mario", "Sergio", "Roberto", "Ivan", "Diego", "Juan",
    "Cesar", "Armando", "Nelson", "Humberto", "Gregorio", "Reinaldo", "Freddy",
    "Alexis", "Douglas", "Orlando", "Wilmer", "Jesus", "Felix", "Raul", "Julio",
]

NAMES_F = [
    "Maria", "Ana", "Rosa", "Carmen", "Luz", "Gladys", "Yolanda", "Sonia",
    "Doris", "Elena", "Patricia", "Marta", "Beatriz", "Daniela", "Gabriela",
    "Alejandra", "Mercedes", "Teresa", "Isabel", "Juana", "Andrea", "Veronica",
    "Laura", "Diana", "Carolina", "Sofia", "Silvia", "Natalia", "Paola", "Adriana",
    "Liliana", "Miriam", "Neida", "Zulay", "Xiomara", "Yajaira", "Yusleidy",
    "Margarita", "Antonia", "Cecilia", "Marisol", "Maribel", "Coromoto", "Elisa",
]

SURNAMES = [
    "Gonzalez", "Rodriguez", "Martinez", "Perez", "Hernandez", "Garcia",
    "Lopez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Castillo",
    "Ortiz", "Romero", "Vasquez", "Rojas", "Morales", "Alvarez", "Medina",
    "Fernandez", "Mendoza", "Pena", "Diaz", "Contreras", "Marquez", "Reyes",
    "Moreno", "Jimenez", "Blanco", "Salazar", "Aguilar", "Chavez", "Delgado",
    "Parra", "Suarez", "Rivas", "Vargas", "Gutierrez", "Carrillo", "Luna",
    "Cruz", "Sosa", "Acosta", "Cordero", "Mora", "Pacheco", "Mendez", "Rincon",
    "Bermudez", "Bravo", "Rangel", "Villanueva", "Lara", "Silva", "Navarro",
    "Camacho", "Padilla", "Escobar", "Riera", "Graterol", "Zambrano", "Colmenares",
    "Guerra", "Paredes", "Fuentes", "Arias", "Bastardo", "Figueroa", "Cabrera",
]

INSTITUTIONS = [
    "Ministerio del Poder Popular para Relaciones Interiores, Justicia y Paz",
    "Cuerpo de Investigaciones Cientificas, Penales y Criminalisticas",
    "Cuerpo de Policia Nacional Bolivariana",
    "Direccion de Prevencion del Delito",
    "Instituto Nacional de Servicios Sociales",
    "Banco Central de Venezuela",
    "Servicio Nacional Integrado de Administracion Aduanera y Tributaria",
    "Ministerio del Poder Popular para la Defensa",
    "Guardia Nacional Bolivariana",
    "Direccion Ejecutiva de la Magistratura",
]

STREETS = [
    "Av. Bolivar", "Calle Sucre", "Av. Miranda", "Calle Urdaneta",
    "Av. Las Delicias", "Calle 10", "Av. Venezuela", "Calle Paez",
    "Av. Fuerzas Armadas", "Calle Real", "Av. Bella Vista", "Calle Principal",
    "Av. Los Proceres", "Calle Bermudez", "Av. Universidad", "Calle Comercio",
    "Callejon 3", "Av. Carabobo", "Av. Libertador", "Calle Union",
]

SECTORS = [
    "El Paraiso", "La Vega", "San Martin", "La Pastora",
    "23 de Enero", "Catia", "San Agustin", "El Valle", "Candelaria",
    "Altagracia", "Santa Rosalia", "Sucre", "San Juan", "La Florida",
    "Los Palos Grandes", "El Marques", "Baruta", "El Hatillo",
    "Petare", "Caricuao", "Antimano", "Macarao",
]

def random_cedula():
    return str(random.randint(5000000, 35000000))

def random_fecha_nac():
    start = date(1960, 1, 1)
    end = date(2005, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

def random_phone():
    return f"0412{random.randint(1000000, 9999999)}"

def random_direccion():
    return f"{random.choice(STREETS)}, Casa {random.randint(1,200)}, {random.choice(SECTORS)}"

def random_email(n, a):
    return f"{n.lower().split()[0]}.{a.lower().split()[0]}{random.randint(1,999)}@{random.choice(['gmail.com','hotmail.com','yahoo.com'])}"

print("=" * 60)
print("  ANONIMIZACION DE BASE DE DATOS")
print(f"  Preservando cedula: {KEEP_CEDULA}")
print("=" * 60)

# Employee fields to update (not cedula first, we'll do that separately)
EMPLOYEE_FIELDS = [
    "nombres", "apellidos", "fechaNacimiento", "correo",
    "telefono_habitacion", "telefono_movil", "profile", "n_contrato",
]

employee_data = Employee.objects.exclude(cedulaidentidad=KEEP_CEDULA)
total = employee_data.count()
count = 0

with transaction.atomic():
    with connection.cursor() as cursor:
        cursor.execute("SET CONSTRAINTS ALL DEFERRED")

        # --- FASE 1: Generar mapeo de cedulas viejas a nuevas y actualizar FKs ---
        print(f"\n[1/7] Preparando mapeo de cedulas ({total} empleados)...")
        cedula_map = {}
        used = set()

        for emp in employee_data.iterator():
            old = emp.cedulaidentidad
            while True:
                new = random_cedula()
                if new not in used:
                    used.add(new)
                    break
            cedula_map[old] = new
            count += 1
            if count % 500 == 0:
                print(f"  Mapeo: {count}/{total}")

        # --- FASE 2: Actualizar AsigTrabajo.employeeCedula ---
        print(f"\n[2/7] Actualizando AsigTrabajo (employeeCedula)...")
        asig_count = 0
        for old_ced, new_ced in cedula_map.items():
            rows = cursor.execute(
                'UPDATE "AsigTrabajo" SET "employeeCedula" = %s WHERE "employeeCedula" = %s',
                [new_ced, old_ced]
            )
            asig_count += 1
            if asig_count % 500 == 0:
                print(f"  AsigTrabajo: {asig_count}/{total}")

        # --- FASE 3: Actualizar Employeefamily.employeecedula_id ---
        print(f"\n[3/7] Actualizando Employeefamily...")
        fam_count = 0
        for old_ced, new_ced in cedula_map.items():
            cursor.execute(
                'UPDATE "RAC_employeefamily" SET "employeeCedula" = %s WHERE "employeeCedula" = %s',
                [new_ced, old_ced]
            )
            fam_count += 1
            if fam_count % 500 == 0:
                print(f"  Family: {fam_count}/{total}")

        # --- FASE 4: Actualizar EmployeeEgresado.employeeCedula ---
        print(f"\n[4/7] Actualizando EmployeeEgresado...")
        eg_count = 0
        for old_ced, new_ced in cedula_map.items():
            cursor.execute(
                'UPDATE "EmployeeEgresado" SET "employeeCedula" = %s WHERE "employeeCedula" = %s',
                [new_ced, old_ced]
            )
            eg_count += 1

        # --- FASE 4.5: Actualizar USER_cuenta.cedula ---
        print(f"\n[4.5/7] Actualizando USER_cuenta (cuentas de usuario)...")
        u_count = 0
        for old_ced, new_ced in cedula_map.items():
            cursor.execute(
                'UPDATE "USER_cuenta" SET "cedula" = %s WHERE "cedula" = %s',
                [new_ced, old_ced]
            )
            u_count += 1
        print(f"  Cuentas actualizadas: {u_count}")

        # --- FASE 5: Actualizar cedulas en Employee ---
        print(f"\n[5/7] Actualizando cedulas en Employee...")
        for old_ced, new_ced in cedula_map.items():
            cursor.execute(
                'UPDATE "Employee" SET "cedulaIdentidad" = %s WHERE "cedulaIdentidad" = %s',
                [new_ced, old_ced]
            )

        # --- FASE 6: Limpiar tablas de simple-history para evitar leaks ---
        print(f"\n[6/7] Limpiando datos historicos...")
        cursor.execute('DELETE FROM "RAC_historicalemployee" WHERE "cedulaIdentidad" != %s', [KEEP_CEDULA])
        cursor.execute('DELETE FROM "RAC_historicalasigtrabajo"')
        cursor.execute('DELETE FROM "RAC_historicalemployeefamily"')

        print(f"  Tablas historicas limpiadas")

    # Transaction commits here - constraints validated

print(f"\n[7/7] Anonimizando datos con Django ORM...")
print(f"  (nombres, apellidos, correos, telefonos, fechas nacimiento, etc.)")

count = 0
for emp in Employee.objects.exclude(cedulaidentidad=KEEP_CEDULA).iterator():
    is_f = emp.sexoid.sexo == "FEMENINO"
    first = random.choice(NAMES_F if is_f else NAMES_M)
    second = random.choice(NAMES_F if is_f else NAMES_M)
    while second == first:
        second = random.choice(NAMES_F if is_f else NAMES_M)
    nombres = f"{first} {second}"

    ap1 = random.choice(SURNAMES)
    ap2 = random.choice(SURNAMES)
    while ap2 == ap1:
        ap2 = random.choice(SURNAMES)
    apellidos = f"{ap1} {ap2}"

    emp.nombres = nombres
    emp.apellidos = apellidos
    emp.fecha_nacimiento = random_fecha_nac()
    emp.correo = random_email(nombres, apellidos)
    emp.telefono_habitacion = f"0212{random.randint(1000000, 9999999)}"
    emp.telefono_movil = random_phone()
    emp.profile = "employee/profile/avatar.png"
    emp.n_contrato = f"CTTO-{random.randint(1000, 9999)}-{random.randint(2020, 2026)}"
    emp.save()

    count += 1
    if count % 500 == 0:
        print(f"  {count}/{total}")

print(f"  Completado: {count} empleados")

# Anonimizar familiares
print(f"\n  Anonimizando familiares...")
fc = 0
fam_used_ceds = set()
for fam in Employeefamily.objects.exclude(
    employeecedula=KEEP_CEDULA
).iterator():
    is_f = fam.sexo and fam.sexo.sexo == "FEMENINO"
    fam.primer_nombre = random.choice(NAMES_F if is_f else NAMES_M)
    fam.segundo_nombre = random.choice(NAMES_F if is_f else NAMES_M)
    fam.primer_apellido = random.choice(SURNAMES)
    fam.segundo_apellido = random.choice(SURNAMES)
    while True:
        new_fam_ced = str(random.randint(5000000, 35000000))
        if new_fam_ced not in fam_used_ceds:
            fam_used_ceds.add(new_fam_ced)
            break
    fam.cedulaFamiliar = new_fam_ced
    fam.fechanacimiento = random_fecha_nac()
    fam.observaciones = random.choice(["", None])
    fam.save()
    fc += 1
    if fc % 500 == 0:
        print(f"    {fc}")

print(f"    Completado: {fc} familiares")

# Anonimizar contacto_emergencia
print(f"\n  Anonimizando contactos de emergencia...")
cc = 0
for c in contacto_emergencia.objects.exclude(
    empleado_id__cedulaidentidad=KEEP_CEDULA
).iterator():
    c.nombres = random.choice(NAMES_M + NAMES_F)
    c.apellidos = random.choice(SURNAMES)
    c.telefono = random_phone()
    c.save()
    cc += 1
print(f"    Completado: {cc} contactos")

# Anonimizar datos_vivienda
print(f"\n  Anonimizando direcciones de vivienda...")
vc = 0
for v in datos_vivienda.objects.exclude(
    empleado_id__cedulaidentidad=KEEP_CEDULA
).iterator():
    v.direccion_exacta = random_direccion()
    v.save()
    vc += 1
print(f"    Completado: {vc} viviendas")

# Agregar antecedentes
print(f"\n  Agregando antecedentes de servicio...")
existing_ant = set(
    antecedentes_servicio.objects.values_list("empleado_id_id", flat=True)
)
ac = 0
for emp in Employee.objects.iterator():
    if emp.id in existing_ant:
        continue
    num = random.randint(1, 3)
    base = emp.fechaingresoorganismo or date(2010, 1, 1)
    for _ in range(num):
        fi = base - timedelta(days=random.randint(365, 7300))
        fe = fi + timedelta(days=random.randint(180, 2560))
        if fe >= (emp.fechaingresoorganismo or date.today()):
            fe = (emp.fechaingresoorganismo or date.today()) - timedelta(days=1)
        antecedentes_servicio.objects.create(
            empleado_id=emp,
            institucion=random.choice(INSTITUTIONS),
            fecha_ingreso=fi,
            fecha_egreso=fe,
        )
    ac += 1
    if ac % 500 == 0:
        print(f"    {ac}")
print(f"    Completado: {ac} empleados con antecedentes")

# Barajar datos de salud
print(f"\n  Barajando perfiles de salud...")
bloods = list(GrupoSanguineo.objects.all())
sc = 0
for ps in perfil_salud.objects.exclude(
    empleado_id__cedulaidentidad=KEEP_CEDULA
).iterator():
    if bloods:
        ps.grupoSanguineo = random.choice(bloods)
        ps.save()
    sc += 1
print(f"    Completado: {sc} perfiles de salud")

print("\n" + "=" * 60)
print("  ANONIMIZACION COMPLETADA")
print(f"  Cedula preservada: {KEEP_CEDULA}")
print(f"  Empleados anonimizados: {total}")
print(f"  Familiares anonimizados: {fc}")
print(f"  Antecedentes agregados: {ac}")
print(f"  Tablas historicas limpiadas")
print("=" * 60)
