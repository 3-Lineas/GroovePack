# @3lineas/groovepack

CLI interactivo para incorporar librerías comunes y utilidades de código fuente directamente a tu proyecto, inspirado en el modelo de componentes de `shadcn`.

En lugar de instalar paquetes pesados en `node_modules`, **Groovepack** copia el código fuente limpio, tipado y optimizado en la ruta que elijas (ej. `src/lib/<lib>`), dándote control total sin dependencias innecesarias.

## Ejecución directa

```bash
npx @3lineas/groovepack
```

## Categorías y Librerías Disponibles

### 1. Common
- **`logger`** (`src/lib/logger`): Logger estructurado universal. Colores ANSI y trazado `[file:line]` en desarrollo (`NODE_ENV === "development"`), JSON plano para Cloudflare Workers / Serverless en producción.
- **`api-client`** (`src/lib/api-client`): Cliente HTTP universal híbrido.
  - Métodos REST ergonómicos (`get`, `post`, `put`, `patch`, `delete`).
  - Serialización segura de datos (con soporte para `BigInt`).
  - Inyección automática de Bearer Token (`localStorage`, cookie o callback personalizado).
  - Fábrica para Hono RPC (`createHonoClient<AppType>`) para proyectos con backend Hono.

### 2. React
- **`api-action`** (`src/lib/api-action`): Wrapper universal para ejecutar llamadas a APIs en componentes y hooks de React.
  - **Hono RPC Opcional**: detecta polimórficamente respuestas HTTP de Hono RPC / Fetch (`MinimalResponse`), respuestas estructuradas (`ActionResponse<T>`) o datos directos.
  - **Solo Logueo de Errores**: únicamente invoca `logger.error` ante fallos HTTP, de validación o excepciones inesperadas; no contamina logs con warnings ni llamadas exitosas.
- **`api-toast`** (`src/lib/api-toast`): Helper sobre `sonner` (`apiToast` y alias `toasted`) que orquesta estados de carga (`loading`), éxito (`success`) y fallo (`error`) para cualquier acción asíncrona, retornando la respuesta tipada.

### 3. Hono / Next Server
- Categoría reservada para utilidades y middlewares de backend.

## Tolerancia a Fallos y Rollback Transaccional (Zero-Crash)

- Cada operación de instalación se ejecuta con `RollbackManager`.
- Si ocurre algún error durante la copia (permisos, ruta errónea, etc.), Groovepack restaura los archivos originales previos y limpia las carpetas creadas, reportando el fallo detallado sin crashear el proceso ni detener las demás librerías seleccionadas.

## Comandos de desarrollo en el paquete

```bash
pnpm install
pnpm run check-types
pnpm run build
pnpm test
```
