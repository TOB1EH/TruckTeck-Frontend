<template>
  <!-- Layout general de la vista (estructura externa del módulo) -->
  <cargo-layout>
    <v-container>
      
      <!-- Título principal de la sección -->
      <h2 class="mb-4">Catálogo de Entidades</h2>

      <!-- Tarjeta superior: contiene título + botones de pestañas -->
      <v-card class="pa-4 mb-6 monitoring-card" elevation="6">
        <!-- Encabezado con título y tabs -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <!-- Nombre de la sección -->
            <h4 class="mb-1">Catálogo de Entidades</h4>
            <div class="caption">Administración de conductores, camiones, productos y clientes.</div>
          </div>

          <!-- Botones de pestañas dinámicas -->
          <div class="d-flex gap-3 align-center">
            <!-- Se recorre la lista de tabs configurada en script -->
            <v-btn
              v-for="t in tabs"
              :key="t.key"
              :class="['tab-btn', { 'active': selected === t.key }]"     
              :color="selected === t.key ? t.color : undefined"           
              rounded
              depressed
              @click="selectTab(t.key)"                                   
            >
              <v-icon left small>{{ t.icon }}</v-icon>
              {{ t.label }}
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Tarjeta principal: tabla + acciones -->
      <v-card class="pa-4 monitoring-card" elevation="6">
        
        <!-- Encabezado de la tabla: botón agregar -->
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center gap-2">
            <!-- Abre el diálogo en modo "agregar" -->
            <v-btn color="green" @click="openAddDialog">
              <v-icon left>mdi-plus</v-icon>
              Agregar {{ currentTabLabel }}
            </v-btn>
          </div>
          <div />
        </div>

        <!-- Tabla que muestra ítems según la pestaña seleccionada -->
        <v-data-table
          :items="currentItems"                         
          :headers="currentHeadersWithActions"
          :items-per-page="itemsPerPage"
          v-model:page="page"
          density="compact"
          class="catalog-table"
        >

          <!-- Slot personalizado para mostrar fullName con estilo -->
          <template #item.fullName="{ item }">
            <div class="accent">{{ item.fullName }}</div>
          </template>

          <!-- Slot personalizado para dominio del camión -->
          <template #item.domain="{ item }">
            <div class="accent">{{ item.domain }}</div>
          </template>

          <!-- Slot para mostrar cisternas formateadas -->
          <template #item.cisterns="{ item }">
            <div>{{ formatCisterns(item.cisterns) }}</div>
          </template>

          <!-- Columna acciones: solo botón Editar -->
          <template #item.actions="{ item }">
            <div class="d-flex align-center gap-2 justify-end">
              <v-btn size="small" color="white" variant="tonal" @click="openEditDialog(item)">
                <v-icon left size="18">mdi-pencil</v-icon> Editar
              </v-btn>
            </div>
          </template>

          <!-- Slot mostrado cuando no hay datos -->
          <template #no-data>
            <v-alert type="info">No hay elementos para mostrar.</v-alert>
          </template>
        </v-data-table>
      </v-card>

      <!-- Diálogo de agregar/editar entidades -->
      <v-dialog v-model="dialog.open" width="640" persistent>
        <v-card class="dialog-card">

          <!-- Encabezado del diálogo -->
          <v-card-title class="dialog-header d-flex align-center justify-space-between pa-5">
            <div>
              <!-- Título según modo del diálogo -->
              <div class="text-h6 dialog-title">
                {{ dialog.mode === 'add' ? 'Agregar' : 'Editar' }} {{ currentTabLabel }}
              </div>
              <div class="caption mt-1">Completa los campos y confirma la acción</div>
            </div>

            <!-- Botón cerrar -->
            <v-btn icon variant="text" @click="closeDialog" class="dialog-close-btn">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <!-- Cuerpo del diálogo: formulario -->
          <v-card-text class="pa-5">
            <v-form ref="formRef">
              <v-row dense>

                <!-- Campos dinámicos según la pestaña seleccionada -->

                <!-- Formulario de conductores -->
                <template v-if="selected === 'drivers'">
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.name" 
                      label="Nombre" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.surname" 
                      label="Apellido" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.documentNumber" 
                      label="Número de documento" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                </template>

                <!-- Formulario de camiones -->
                <template v-else-if="selected === 'trucks'">
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.domain" 
                      label="Dominio" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.description" 
                      label="Descripción" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                  <!-- Se ingresan las cisternas como string separado por comas -->
                  <v-col cols="12">
                    <v-text-field 
                      v-model="cisternsStr" 
                      label="Cisternas (separadas por coma)" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                </template>

                <!-- Formulario de productos -->
                <template v-else-if="selected === 'products'">
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.name" 
                      label="Nombre" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.description" 
                      label="Descripción" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                </template>

                <!-- Formulario de clientes -->
                <template v-else>
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.companyName" 
                      label="Nombre de la compañía" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field 
                      v-model="form.contactName" 
                      label="Nombre de contacto" 
                      variant="outlined" 
                      density="comfortable"
                      class="dark-input"
                    />
                  </v-col>
                </template>

              </v-row>
            </v-form>

            <!-- Error mostrado si ocurre un fallo al guardar -->
            <v-alert v-if="dialog.error" type="error" class="mt-3" variant="tonal">
              {{ dialog.error }}
            </v-alert>
          </v-card-text>

          <!-- Acciones del diálogo -->
          <v-card-actions class="dialog-actions justify-end pa-5 pt-0">
            <v-btn variant="text" @click="closeDialog" class="dialog-cancel-btn">Cancelar</v-btn>

            <!-- Botón guardar o agregar según el modo -->
            <v-btn color="orange" :loading="dialog.loading" @click="submitDialog" class="dialog-submit-btn">
              {{ dialog.mode === 'add' ? 'Agregar' : 'Guardar' }}
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-dialog>

    </v-container>
  </cargo-layout>
</template>



<script setup>
  /**
   * Script principal del componente Catálogo de Entidades.
   * Gestiona pestañas, tablas, diálogos CRUD y vinculación con los catálogos globales.
   */
import { ref, computed, onMounted, watch } from 'vue';
import CargoLayout from '@/layouts/CargoLayout.vue';
import { useCatalogs, drivers, trucks, products, clients } from '@/composables/useCatalogs.js';
import {
  createDriver, updateDriver,
  createTruck, updateTruck,
  createProduct, updateProduct,
  createClient, updateClient
} from '@/services/catalogService.js';

/**
 * Lista de pestañas disponibles en el catálogo.
 * Cada pestaña define:
 * - key: identificador lógico
 * - label: texto visible
 * - icon: ícono de Vuetify
 * - color: color aplicado al botón activo
 */
const tabs = [
  { key: 'drivers', label: 'Conductores', icon: 'mdi-account', color: 'green' },
  { key: 'trucks', label: 'Camiones', icon: 'mdi-truck', color: 'blue' },
  { key: 'products', label: 'Productos', icon: 'mdi-cube', color: 'purple' },
  { key: 'clients', label: 'Clientes', icon: 'mdi-domain', color: 'orange' },
];

/**
 * Pestaña actualmente seleccionada.
 * Determina qué tabla, formulario y headers mostrar.
 */
const selected = ref('drivers');

/**
 * Paginación (mismo comportamiento que en Monitoring: footer por defecto, 10 items/pg)
 */
const page = ref(1);
const itemsPerPage = ref(10);

/**
 * Hook que provee función de carga y catálogos reactivos globales.
 */
const { load } = useCatalogs();

/**
 * Carga inicial de catálogos al montar el componente.
 */
onMounted(() => { load(); });

/**
 * Cambia la pestaña activa.
 * @param {string} k - Clave de la pestaña seleccionada.
 */
function selectTab(k) { selected.value = k; }

/**
 * Devuelve los items a mostrar según la pestaña seleccionada.
 */
const currentItems = computed(() => {
  if (selected.value === 'drivers') return drivers.value;
  if (selected.value === 'trucks') return trucks.value;
  if (selected.value === 'products') return products.value;
  return clients.value;
});

/**
 * Resetear página al cambiar de pestaña o cuando cambia el listado
 * para evitar quedar en una página fuera de rango.
 */
 /**
 * Observa el valor `selected` (pestaña o categoría actual).
 * Cada vez que cambia, reinicia la paginación a la página 1.
 * Esto asegura que al cambiar de pestaña no se conserve una página
 * que podría no existir en la nueva colección de elementos.
 */
watch(selected, () => { page.value = 1; });

/**
 * Observa la lista de elementos actualmente visibles (`currentItems`).
 * Cada vez que la lista cambia:
 *  - Calcula la cantidad total de ítems.
 *  - Determina cuántas páginas son necesarias según `itemsPerPage`.
 *  - Ajusta la página actual si está fuera del rango permitido.
 * Este mecanismo previene inconsistencias en la vista, como quedar
 * en una página inexistente después de un filtro, búsqueda o cambio de datos.
 */
watch(currentItems, (list) => {
  const total = list?.length ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / itemsPerPage.value));
  if (page.value > maxPage) page.value = maxPage;
});

/**
 * Devuelve los headers correspondientes a la pestaña activa
 * sin incluir la columna de acciones.
 */
const currentHeaders = computed(() => {
  if (selected.value === 'drivers') {
    return [
      { title: 'Id', key: 'id' },
      { title: 'Nombre completo', key: 'fullName' },
      { title: 'Número de documento', key: 'documentNumber' },
      { title: 'Código externo', key: 'externalCode' },
    ];
  }
  if (selected.value === 'trucks') {
    return [
      { title: 'Id', key: 'id' },
      { title: 'Dominio', key: 'domain' },
      { title: 'Descripción', key: 'description' },
      { title: 'Cisternas', key: 'cisterns' },
      { title: 'Código externo', key: 'externalCode' },
    ];
  }
  if (selected.value === 'products') {
    return [
      { title: 'Id', key: 'id' },
      { title: 'Nombre', key: 'name' },
      { title: 'Descripción', key: 'description' },
      { title: 'Código externo', key: 'externalCode' },
    ];
  }
  return [
    { title: 'Id', key: 'id' },
    { title: 'Nombre de la compañía', key: 'companyName' },
    { title: 'Nombre de contacto', key: 'contactName' },
    { title: 'Código externo', key: 'externalCode' },
  ];
});

/**
 * Devuelve los headers incluyendo la columna de acciones (editar).
 */
const currentHeadersWithActions = computed(() => [...currentHeaders.value, { title: '', key: 'actions', sortable: false }]);

/**
 * Formatea un arreglo de cisternas como lista separada por comas.
 * @param {Array<number>} arr
 * @returns {string}
 */
function formatCisterns(arr) { if (!arr || arr.length === 0) return '--'; return arr.join(', '); }

/**
 * Obtiene el label visible de la pestaña actual.
 */
const currentTabLabel = computed(() => tabs.find(x => x.key === selected.value)?.label || '');

/**
 * Estado del cuadro de diálogo CRUD.
 */
const dialog = ref({ open: false, mode: 'add', loading: false, error: null });

/** Referencia al formulario de Vuetify */
const formRef = ref();

/** Datos del formulario dinámico según entidad */
const form = ref({});

/** Campo auxiliar para editar cisternas como string */
const cisternsStr = ref('');

/** Valor original de externalCode para preservarlo en edición */
const originalExternalCode = ref(null);

/**
 * Abre el diálogo en modo "Agregar".
 * Limpia formulario y valores auxiliares.
 */
function openAddDialog() {
  dialog.value = { open: true, mode: 'add', loading: false, error: null };
  form.value = {};
  cisternsStr.value = '';
  originalExternalCode.value = null;
}

/**
 * Abre el diálogo en modo "Editar" cargando los datos del registro seleccionado.
 * @param {Object} item - Elemento seleccionado de la tabla.
 */
function openEditDialog(item) {
  dialog.value = { open: true, mode: 'edit', loading: false, error: null };

  // Guardar externalCode para enviarlo nuevamente en update
  originalExternalCode.value = item.externalCode !== '--' ? item.externalCode : null;

  if (selected.value === 'drivers') {
    form.value = {
      id: item.id,
      name: item.fullName?.split(' ')[0] ?? '',
      surname: item.fullName?.split(' ').slice(1).join(' ') ?? '',
      documentNumber: item.documentNumber !== '--' ? item.documentNumber : '',
    };
  } else if (selected.value === 'trucks') {
    form.value = {
      id: item.id,
      domain: item.domain !== '--' ? item.domain : '',
      description: item.description !== '--' ? item.description : '',
      cisterns: Array.isArray(item.cisterns) ? item.cisterns : [],
    };
    cisternsStr.value = (form.value.cisterns || []).join(',');
  } else if (selected.value === 'products') {
    form.value = {
      id: item.id,
      name: item.name !== '--' ? item.name : '',
      description: item.description !== '--' ? item.description : '',
    };
  } else {
    form.value = {
      id: item.id,
      companyName: item.companyName !== '--' ? item.companyName : '',
      contactName: item.contactName !== '--' ? item.contactName : '',
    };
  }
}

/**
 * Cierra el diálogo dejando estados consistentes.
 */
function closeDialog() { dialog.value.open = false; dialog.value.error = null; dialog.value.loading = false; }

/**
 * Procesa envío del formulario tanto en modo "Agregar" como "Editar".
 * Realiza la conversión de cisternas, preserva externalCode y ejecuta el servicio correspondiente.
 */
async function submitDialog() {
  dialog.value.loading = true;
  dialog.value.error = null;

  try {
    // Conversión de cisternas sólo para camiones
    if (selected.value === 'trucks') {
      const arr = (cisternsStr.value || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(n => parseInt(n, 10))
        .filter(n => !isNaN(n));
      form.value.cisterns = arr;
    }

    // Preservar externalCode en modo edición
    if (dialog.value.mode === 'edit' && originalExternalCode.value !== null) {
      form.value.externalCode = originalExternalCode.value;
    }

    // Llamar al servicio adecuado
    if (dialog.value.mode === 'add') {
      await createCurrent(form.value);
    } else {
      await updateCurrent(form.value);
    }

    await load();
    closeDialog();
  } catch (e) {
    console.error(e);
    dialog.value.error = e.message || 'Error guardando el registro';
  } finally {
    dialog.value.loading = false;
  }
}

/**
 * Ejecuta el servicio de creación según el tipo de entidad.
 * @param {Object} payload
 */
async function createCurrent(payload) {
  if (selected.value === 'drivers') return createDriver(payload);
  if (selected.value === 'trucks') return createTruck(payload);
  if (selected.value === 'products') return createProduct(payload);
  return createClient(payload);
}

/**
 * Ejecuta el servicio de actualización según el tipo de entidad.
 * @param {Object} payload
 */
async function updateCurrent(payload) {
  if (selected.value === 'drivers') return updateDriver(payload);
  if (selected.value === 'trucks') return updateTruck(payload);
  if (selected.value === 'products') return updateProduct(payload);
  return updateClient(payload);
}
</script>


<style scoped>
/* 
 * Títulos principales dentro de la vista.
 * Se utiliza un color blanco puro para resaltar sobre el fondo oscuro.
 */
h2 { color: #fff; }

/* 
 * Tarjeta de monitoreo: estilo general del contenedor.
 * - Fondo semitransparente oscuro.
 * - Texto en blanco.
 * - Bordes redondeados.
 * - Sutil borde externo para definir el contorno.
 */
.monitoring-card {
  background: rgba(8,16,26,0.6);
  color: #fff;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.04);
}

/*
 * Texto secundario (caption).
 * Se muestra en un gris claro para dar jerarquía visual.
 */
.caption { color: rgba(255,255,255,0.65); }

/*
 * Texto más atenuado para información menos relevante.
 */
.muted { color: rgba(255,255,255,0.45); }

/*
 * Botones de pestañas (tabs).
 * - Fondo casi transparente.
 * - Colores claros para buen contraste.
 * - Bordes redondeados tipo "píldora".
 */
.tab-btn {
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.8);
  border-radius: 999px;
  text-transform: none;
}

/*
 * Estado activo del botón de pestaña.
 * Fuerza el color blanco para indicar selección.
 */
.tab-btn.active { 
  color: white !important; 
}

/*
 * Elementos que deben destacarse con un color acentuado
 * (amarillo anaranjado). Se usa tipografía más gruesa.
 */
.accent { 
  color: #ffb94d; 
  font-weight: 700; 
}

/*
 * Estilos para personalizar el aspecto de tablas utilizadas en catálogos.
 * Se eliminan colores de fondo predeterminados y se aplican capas 
 * semitransparentes propias del diseño oscuro.
 */
.catalog-table { 
  background: transparent !important; 
}

/* Wrapper interno de la tabla (Vuetify): fondo transparente */
.catalog-table :deep(.v-data-table__wrapper) { 
  background: transparent; 
}

/* Tabla base sin fondo */
.catalog-table :deep(table) { 
  background: transparent; 
}

/* Encabezado de tabla con ligera capa semitransparente */
.catalog-table :deep(thead) { 
  background: rgba(255, 255, 255, 0.05); 
}

/* Filas del cuerpo sin fondo visible */
.catalog-table :deep(tbody tr) { 
  background: transparent !important; 
}

/* Hover sobre filas del cuerpo: capa más clara */
.catalog-table :deep(tbody tr:hover) { 
  background: rgba(255, 255, 255, 0.08) !important; 
}

/* Encabezados de columnas: 
 * - Texto gris claro
 * - Mayor peso tipográfico
 * - Borde inferior para separar visualmente
 */
.catalog-table :deep(th) {
  color: rgba(255,255,255,0.7) !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.12) !important;
}

/* Celdas del cuerpo:
 * - Texto más blanco para mejor lectura
 * - Sutil línea divisoria inferior
 */
.catalog-table :deep(td) {
  color: rgba(255,255,255,0.9) !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}

/* Footer de paginación (alineado al estilo usado en Monitoring/Orders para mantener consistencia en el estilo de 
la pagina web completa) */
.catalog-table :deep(.v-data-table-footer) {
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 8px 16px;
}

.catalog-table :deep(.v-data-table-footer .v-select),
.catalog-table :deep(.v-data-table-footer .v-select__selection),
.catalog-table :deep(.v-data-table-footer .v-pagination),
.catalog-table :deep(.v-data-table-footer .v-pagination__item),
.catalog-table :deep(.v-data-table-footer .v-pagination__navigation),
.catalog-table :deep(.v-data-table-footer .v-icon),
.catalog-table :deep(.v-data-table-footer .v-data-table-footer__items-per-page),
.catalog-table :deep(.v-data-table-footer .v-data-table-footer__info) {
  color: #fff !important;
}

.catalog-table :deep(.v-data-table-footer .v-pagination__item) {
  background: rgba(255,255,255,0.05) !important;
}

.catalog-table :deep(.v-data-table-footer .v-pagination__item--active) {
  background: rgba(255,255,255,0.15) !important;
}

.catalog-table :deep(.v-data-table-footer .v-pagination__navigation) {
  background: rgba(255,255,255,0.05) !important;
}
</style>