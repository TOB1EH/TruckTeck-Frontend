# TruckTeck - Frontend

Frontend SPA para el proyecto TruckTeck: monitoreo de órdenes de carga y gestión de alarmas de temperatura. Construido con Vue 3 (Composition API) y Vuetify.

## Resumen
Esta aplicación muestra órdenes de carga en tiempo real, calcula ETA, muestra datos de masa/temperatura/caudal y permite gestionar alarmas de temperatura. Incluye una configuración global de alarmas (umbral y lista de emails) y un flujo para aceptar alarmas desde la UI.

Tecnologías principales:
- Vue 3 (Composition API)
- Vuetify (UI)
- Fetch wrapper para llamadas REST
- Estructura modular con `services/` y `composables/`

---

## Funcionalidades principales
- Autenticación y control de UI por roles (ADMIN/OPERATOR/VIEWER) — integración con `useAuth`.
- Listado de órdenes con filtros, ordenamiento y datos en tiempo real (polling cada 10s).
- Cálculo de ETA: (Preset - Masa acumulada) / Caudal.
- Panel de alarmas:
  - Alarmas pendientes y aceptadas.
  - Aceptación de alarma via PUT (`/alarm/reset-email/{id}`).
  - Badge con conteo de pendientes y diálogo de confirmación.
- Configuración global de alarmas:
  - Modal para editar `threshold` y `emails`.
  - PUT `/api/v1/alarm` para persistir la configuración.
  - Validación de emails (uno o varios separados por coma).
  - Umbral obligatorio antes de guardar.
- Validaciones y feedback en la UI (mensajes, loaders).


---

## Variables de entorno
Es necesario crear un archivo ```.env``` con una variable ```VITE_API_BASE_URL```para ajustar el endpoint que se conecte con el backend.
---

## Estructura del proyecto (archivos clave)
- [AlarmsView.vue] — UI principal de alarmas y modal de configuración.
- [useAlarms.js] — lógica reactiva para cargar/aceptar/actualizar configuración de alarmas.
- [alarmsService.js] — llamadas REST relacionadas con alarmas.
- [httpClient.js] — wrapper para fetch (maneja headers, JSON, errores).
- [api.js] — endpoints centralizados.
- [useAuth.js] — estado y funciones de autenticación (mostrar/ocultar UI según rol).
- [LoadView.vue], `MonitoringView.vue`, `OrdersTable.vue` — vistas relacionadas con órdenes, carga y métricas.

---

## Instalación y ejecución (desarrollo)
Requisitos: Node.js (16+), npm/yarn.

1. Instalar dependencias:
```
npm install
# o
yarn
```
2. Configurar variables de entorno:
Crear .env con VITE_API_BASE_RUL

3. Ejecutar en modo desarrollo:
```
npm run dev
# o
yarn dev
```

4. Construir para producción:
```
npm run build
# o
yarn build
```

## Buenas prácticas y notas de desarrollo

* Polling: la vista de alarmas usa polling cada 10s en useAlarms (puedes cambiar a WebSocket para menor latencia; ver websocketService.js).
* Validación: el modal valida que el umbral sea > 0 y que los emails sean válidos (uno o varios, separados por comas).
* Seguridad: ocultar/mostrar controles sensibles según user.role desde useAuth. Sin embargo, la validación final de permisos debe realizarse en el backend.
* Manejo de errores: los servicios y composables registran errores en consola y muestran alertas simples; considerar toasts para producción.

## Contribuciones
1. Fork del repositorio.
2. Crear branch con tu feature/bugfix.
3. Hacer PR describiendo cambios e impacto.
4. Ejecutar linters/tests antes de merge.

## Contacto

Si querés reportar un bug, proponer una mejora o colaborar, contactanos por cualquiera de estos canales:

- Correo electrónico del equipo:
  - gzaragosi782@alumnos.iua.edu.ar
  - abrambilla804@alumnos.iua.edu.ar
  - tfunes744@alumnos.iua.edu.ar

Intentaremos responder en 1–3 días hábiles. Si necesitás soporte urgente, marcá el asunto como `[Urgente]`.



