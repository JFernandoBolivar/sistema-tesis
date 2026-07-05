---
name: arquitecto-scream-feature-onion
description: Arquitecto SCREAM + Feature-Based + Onion para proyectos con módulos y features. Crea estructuras de carpetas, valida dependencias y sugiere mejoras de modularización.
---

# Arquitecto SCREAM-Feature-Onion

Skill para trabajar con la arquitectura del proyecto basada en Scream + Feature-Based + Onion.

---

## Arquitectura del proyecto

```
modules/
└── [modulo]/
    ├── feats/
    │   └── [feature]/
    │       ├── domain/
    │       │   ├── entities/
    │       │   │   └── [Nombre].ts
    │       │   ├── value-objects/
    │       │   │   └── [NombreVO].ts
    │       │   └── ports/
    │       │       └── Repositorio[Nombre].ts
    │       ├── application/
    │       │   ├── dto/
    │       │   │   └── [Nombre]DTO.ts
    │       │   └── use-cases/
    │       │       └── Listar[Nombres].ts
    │       ├── infraestructure/
    │       │   ├── http/
    │       │   │   └── cliente[Backend].ts
    │       │   ├── mappers/
    │       │   │   └── Mapeador[Nombre].ts
    │       │   └── repositories/
    │       │       ├── Repositorio[Nombre]Mock.ts
    │       │       └── Repositorio[Nombre][Backend].ts
    │       └── ui/
    │           ├── schema/
    │           │   └── [nombre]-schema.ts
    │           └── [Nombre]Lista.tsx
    └── shared/ (opcional)
        ├── domain/
        ├── application/
        ├── infraestructure/
        └── ui/
```

### Capas y dependencias (Onion)

La flecha significa "depende de" → **siempre apunta hacia adentro**:

```
ui → infraestructure → application → domain
```

- **domain/** — Sin dependencias externas. Solo tipos y factories.
- **application/** — Depende solo de `domain/`.
- **infraestructure/** — Implementa los ports de `domain/`. Depende de `domain/` y `application/`.
- **ui/** — Capa más externa. Depende de `application/` (DTOs) y componentes de `shared/`.

### Shared

- `modules/[modulo]/shared/` — Código compartido entre features del **mismo módulo** (VOs, tipos, helpers, componentes)
- `shared/` (raíz del proyecto) — Código compartido entre **módulos diferentes**

**Regla**: si 2 o más features usan el mismo VO/entity/componente, migrar a `shared/` del módulo. Si 2 o más módulos lo usan, migrar a `shared/` raíz.

---

## Comandos

### 1. Crear una feature

```
@skill crea la feature de [nombre] en el módulo [modulo]
```

**Flujo:**
1. Verificar que `modules/[modulo]/feats/` existe. Si no, preguntar si crearlo.
2. Crear `modules/[modulo]/feats/[nombre]/` con toda la estructura de subcarpetas.
3. Generar los 8 archivos base desde las plantillas.
4. Preguntar: *"¿Quieres agregar campos adicionales a la entidad o algún Value Object?"*
5. Preguntar: *"¿Este feature necesita un schema Zod para formularios?"*

### 2. Validar una feature

```
@skill valida [feature] en [modulo]
```

Lee todos los archivos de la feature y aplica las reglas de validación Onion (R1-R6). Reporta violaciones con mensajes y sugerencias.

### 3. Sugerir mejoras

```
@skill sugiere mejoras en [modulo]
```

Escanea todas las features del módulo, detecta VOs, tipos, componentes o schemas duplicados. Si encuentra duplicación entre 2+ features, sugiere migrar a `modules/[modulo]/shared/`.

---

## Reglas de estilo

### Naming

- **camelCase** — funciones, variables, métodos, parámetros (`obtenerVehiculosPorChofer`, `buscarPorCedula`)
- **PascalCase** — tipos, interfaces, clases, componentes React (`VehiculoEntity`, `CrearVehiculoDTO`, `VehiculoLista`)
- **Nombres semánticos** — nada de `data`, `obj`, `item`, `tmp`. El nombre debe describir el contenido: `vehiculos`, `choferesActivos`, `serviciosPorTipo`

### TypeScript

- **Sin `any`** — prohibido. Usar `unknown` si es necesario, con type guard.
- **Tipos explícitos** en parámetros y retornos de funciones.
- **`readonly`** en propiedades de entidades y value objects.
- **Sin clases** — solo tipos (`type`/`interface`) + funciones puras.

### Zod

- Los schemas de validación van en `ui/schema/[nombre]-schema.ts`
- Se usan con `react-hook-form` + `@hookform/resolvers`
- Los schemas se comparten entre el schema y el server action cuando aplica

### Factories

- Toda entidad se crea con una función factory: `crearVehiculo(datos): Vehiculo`
- Validan datos de entrada y lanzan `Error` descriptivo si algo falta
- Transforman value objects planos a tipados

---

## Plantillas de archivos base

### Value Object — `domain/value-objects/[NombreVO].ts`

```typescript
export type [NombreVO] = {
  readonly value: string;
};

export function crear[NombreVO](valor: string): [NombreVO] {
  if (!valor || valor.trim().length === 0) {
    throw new Error(`[NombreVO] inválido: se requiere un valor no vacío`);
  }
  return { value: valor.trim() };
}
```

### Entity — `domain/entities/[Nombre].ts`

```typescript
import type { [NombreVO] } from '../value-objects/[NombreVO]';

export type [Nombre] = {
  readonly id: string;
  readonly [campo]: [NombreVO];
};

export function crear[Nombre](id: string, [campo]: [NombreVO]): [Nombre] {
  if (!id) throw new Error('[Nombre]: ID requerido');
  return { id, [campo] };
}
```

### Puerto — `domain/ports/Repositorio[Nombre].ts`

```typescript
import type { [Nombre] } from '../entities/[Nombre]';

export type Repositorio[Nombre] = {
  obtenerTodos(): Promise<[Nombre][]>;
  obtenerPorId(id: string): Promise<[Nombre] | null>;
  crear(entidad: [Nombre]): Promise<[Nombre]>;
  actualizar(id: string, datos: Partial<[Nombre]>): Promise<[Nombre]>;
  eliminar(id: string): Promise<void>;
};
```

### DTO — `application/dto/[Nombre]DTO.ts`

```typescript
export type [Nombre]DTO = {
  id: string;
  [campo]: string;
};
```

### Caso de uso — `application/use-cases/Listar[Nombres].ts`

```typescript
import type { Repositorio[Nombre] } from '../../domain/ports/Repositorio[Nombre]';
import type { [Nombre]DTO } from '../dto/[Nombre]DTO';

export async function listar[Nombres](
  repositorio: Repositorio[Nombre]
): Promise<[Nombre]DTO[]> {
  const entidades = await repositorio.obtenerTodos();
  return entidades.map((entidad) => ({
    id: entidad.id,
    [campo]: entidad.[campo].value,
  }));
}
```

### Mapper — `infraestructure/mappers/Mapeador[Nombre].ts`

```typescript
import type { [Nombre] } from '../../domain/entities/[Nombre]';
import { crear[Nombre] } from '../../domain/entities/[Nombre]';
import { crear[NombreVO] } from '../../domain/value-objects/[NombreVO]';

export type Respuesta[Backend] = {
  id: string;
  [campo_raw]: string;
};

export function mapearA[Nombre](respuesta: Respuesta[Backend]): [Nombre] {
  const [campo] = crear[NombreVO](respuesta.[campo_raw]);
  return crear[Nombre](respuesta.id, [campo]);
}
```

### Mock Repository — `infraestructure/repositories/Repositorio[Nombre]Mock.ts`

```typescript
import type { Repositorio[Nombre] } from '../../domain/ports/Repositorio[Nombre]';
import { crear[Nombre] } from '../../domain/entities/[Nombre]';
import { crear[NombreVO] } from '../../domain/value-objects/[NombreVO]';

export const repositorio[Nombre]Mock: Repositorio[Nombre] = {
  obtenerTodos: async () => [
    crear[Nombre]('1', crear[NombreVO]('valor-ejemplo-1')),
    crear[Nombre]('2', crear[NombreVO]('valor-ejemplo-2')),
  ],
  obtenerPorId: async (id: string) => {
    if (id === '1') return crear[Nombre]('1', crear[NombreVO]('valor-ejemplo-1'));
    return null;
  },
  crear: async (entidad) => entidad,
  actualizar: async (_id, datos) => {
    throw new Error('No implementado');
  },
  eliminar: async (_id) => {
    throw new Error('No implementado');
  },
};
```

### Backend Repository — `infraestructure/repositories/Repositorio[Nombre][Backend].ts`

```typescript
import type { Repositorio[Nombre] } from '../../domain/ports/Repositorio[Nombre]';
import type { [Nombre] } from '../../domain/entities/[Nombre]';
import { mapearA[Nombre] } from '../mappers/Mapeador[Nombre]';

export function crearRepositorio[Nombre][Backend](
  cliente: typeof cliente[Backend]
): Repositorio[Nombre] {
  return {
    obtenerTodos: async () => {
      const datos = await cliente.obtenerTodos();
      return datos.map(mapearA[Nombre]);
    },
    obtenerPorId: async (id: string) => {
      const dato = await cliente.obtenerPorId(id);
      return dato ? mapearA[Nombre](dato) : null;
    },
    crear: async (entidad: [Nombre]) => {
      const dato = await cliente.crear(entidad);
      return mapearA[Nombre](dato);
    },
    actualizar: async (id: string, datos: Partial<[Nombre]>) => {
      const dato = await cliente.actualizar(id, datos);
      return mapearA[Nombre](dato);
    },
    eliminar: async (id: string) => {
      await cliente.eliminar(id);
    },
  };
}
```

### Schema Zod — `ui/schema/[nombre]-schema.ts`

```typescript
import { z } from 'zod';

export const [nombre]Schema = z.object({
  [campo]: z.string().min(1, 'El campo es requerido'),
});

export type [Nombre]FormType = z.infer<typeof [nombre]Schema>;
```

### UI Component — `ui/[Nombre]Lista.tsx`

```typescript
import type { [Nombre]DTO } from '../application/dto/[Nombre]DTO';

interface [Nombre]ListaProps {
  items: [Nombre]DTO[];
  onSeleccionar?: (id: string) => void;
}

export function [Nombre]Lista({ items, onSeleccionar }: [Nombre]ListaProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay [nombre]s registrados.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 cursor-pointer rounded-sm transition-colors"
          onClick={() => onSeleccionar?.(item.id)}
        >
          <span className="text-sm font-medium text-foreground">{item.id}</span>
        </li>
      ))}
    </ul>
  );
}
```

---

## Reglas de validación Onion

| Regla | Violación | Mensaje |
|-------|-----------|---------|
| **R1** | `domain/` importa de `application/`, `infraestructure/`, `ui/` o externo | ❌ **R1**: Domain no puede importar de capas externas. Solo puede importar de otros archivos dentro de `domain/`. |
| **R2** | `application/` importa de `infraestructure/` o `ui/` | ❌ **R2**: Application no puede importar de infraestructure ni ui. Solo puede importar de `domain/`. |
| **R3** | `ui/` importa de `infraestructure/` | ❌ **R3**: UI no puede importar de infraestructure. Los datos deben llegar por props (DTOs) o Server Actions. |
| **R4** | Un caso de uso instancia un repositorio con `new` o importa una implementación concreta | ❌ **R4**: Los casos de uso deben recibir el repositorio por parámetro (inyección de dependencias), no instanciarlo directamente. |
| **R5** | Un componente UI recibe una entidad del dominio en lugar de un DTO | ❌ **R5**: UI debe recibir DTOs, no entidades de dominio. Las entidades contienen lógica de dominio que no debe exponerse. |
| **R6** | Imports relativos con más de 2 `../` | ⚠️ **R6**: Considera usar alias de importación (`@modules/...`) en lugar de rutas relativas largas. |

---

## Instrucciones adicionales

1. **Siempre confirmar** antes de sobrescribir archivos existentes.
2. Si el usuario no especifica el módulo, preguntar: *"¿En qué módulo deseas crear la feature? (ej: transporte, tienda, facturacion)"*
3. Al crear una feature, preguntar por campos adicionales después de generar la estructura base.
4. Si durante la validación se detecta que un VO se repite en 2+ features del mismo módulo, sugerir migrar a `modules/[modulo]/shared/`.
5. Si durante la validación se detecta que un tipo/schema se repite en 2+ módulos diferentes, sugerir migrar a `shared/` raíz.

---

## Ejemplo de uso

**Usuario:**
```
@skill Arquitecto SCREAM-Feature-Onion crea la feature de vehiculos en el módulo transporte
```

**Skill responde:**
1. Verifica que `modules/transporte/feats/` existe (si no, lo crea)
2. Crea `modules/transporte/feats/vehiculos/` con todas las subcarpetas
3. Genera los 9 archivos base:
   - `domain/value-objects/PlacaVO.ts`
   - `domain/entities/Vehiculo.ts`
   - `domain/ports/RepositorioVehiculo.ts`
   - `application/dto/VehiculoDTO.ts`
   - `application/use-cases/ListarVehiculos.ts`
   - `infraestructure/mappers/MapeadorVehiculo.ts`
   - `infraestructure/repositories/RepositorioVehiculoMock.ts`
   - `infraestructure/repositories/RepositorioVehiculoBackend.ts`
   - `ui/VehiculoLista.tsx`
   - `ui/schema/vehiculo-schema.ts`
4. Pregunta: *"¿Quieres agregar campos adicionales como 'marca', 'modelo', 'anio'? ¿Algún Value Object específico?"*
