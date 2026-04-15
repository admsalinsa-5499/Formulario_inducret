/*
  ╔══════════════════════════════════════════════════════════╗
  ║  script.js — Inducret Alta de Empleados                  ║
  ║                                                          ║
  ║  CONTENIDO:                                              ║
  ║  1. Estado global                                        ║
  ║  2. Navegación entre secciones                           ║
  ║  3. Funciones de validación de campos                    ║
  ║  4. Lógica de familiares (agregar/eliminar)              ║
  ║  5. Previsualización de documentos (DNI/Licencia)        ║
  ║  6. Exportación a Excel (.xlsx) con SheetJS              ║
  ║  7. Generación del código QR                             ║
  ║  8. Funciones utilitarias (toast, etc.)                  ║
  ╚══════════════════════════════════════════════════════════╝
*/

// ═══════════════════════════════════════════════════════════
// 1. ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════

// Guardamos los archivos de documentos en un objeto
// para poder descargarlos junto con el Excel
const documentos = {
  dniFrente:   null,   // File object o null
  dniDorso:    null,
  licFrente:   null,
  licDorso:    null,
  fotoCarnet:  null,   // Blob con la foto capturada por cámara o archivo
};

// Stream de la cámara para la foto carnet (lo guardamos para poder apagarlo)
let streamCarnet = null;

// Contador de familiares (para dar ID único a cada bloque)
let contadorFamiliares = 0;

// Sección activa actualmente
let seccionActual = 1;
const TOTAL_SECCIONES = 6;


// ═══════════════════════════════════════════════════════════
// 2. NAVEGACIÓN ENTRE SECCIONES
// ═══════════════════════════════════════════════════════════

/**
 * Muestra la sección indicada y oculta el resto.
 * Antes de avanzar, valida la sección actual.
 *
 * @param {number} numero - Número de sección (1 a 6)
 */
function irA(numero) {
  // Si avanzamos (numero > actual), validamos la sección actual
  if (numero > seccionActual) {
    if (!validarSeccion(seccionActual)) {
      mostrarToast('⚠️ Corregí los campos marcados en rojo antes de continuar.', 'error');
      return;
    }
  }

  // Ocultar sección actual
  document.getElementById('sec-' + seccionActual).classList.remove('active');

  // Actualizar barra de progreso
  const pasoAnterior = document.querySelector(`.progress-step[data-step="${seccionActual}"]`);
  if (pasoAnterior) {
    pasoAnterior.classList.remove('active');
    if (numero > seccionActual) pasoAnterior.classList.add('done');
  }

  // Mostrar nueva sección
  seccionActual = numero;
  const nuevaSeccion = document.getElementById('sec-' + seccionActual);
  if (nuevaSeccion) {
    nuevaSeccion.classList.add('active');
    nuevaSeccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Actualizar barra de progreso
  const pasoNuevo = document.querySelector(`.progress-step[data-step="${seccionActual}"]`);
  if (pasoNuevo) pasoNuevo.classList.add('active');
}


// ═══════════════════════════════════════════════════════════
// 3. FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════

/*
  Cada función de validación retorna true (válido) o false (inválido).
  Muestra/oculta mensajes de error según corresponda.
*/

/**
 * Valida todos los campos de una sección.
 * @param {number} sec - Número de sección
 * @returns {boolean}
 */
function validarSeccion(sec) {
  switch (sec) {
    case 1: return validarSeccion1();
    case 2: return validarSeccion2();
    case 3: return validarSeccion3();
    case 4: return validarSeccion4();
    default: return true;
  }
}

/* ── SECCIÓN 1: Identificación ── */
function validarSeccion1() {
  let ok = true;
  ok = validarNoVacio('Apellido',     'El apellido es obligatorio.')          && ok;
  ok = validarNoVacio('Nombre',       'El nombre es obligatorio.')            && ok;
  ok = validarNoVacio('TipoDocumentoCodigo', 'Seleccioná el tipo de documento.') && ok;
  ok = validarDNI()                                                           && ok;
  ok = validarCuil()                                                          && ok;
  return ok;
}

/* ── SECCIÓN 2: Domicilio ── */
function validarSeccion2() {
  return validarNoVacio('Calle', 'La calle es obligatoria.');
}

/* ── SECCIÓN 3: Contacto ── */
function validarSeccion3() {
  let ok = true;
  const cel = document.getElementById('TelefonoCelular').value.trim();
  const email = document.getElementById('Email').value.trim();

  // Teléfono celular: si tiene algo, debe ser exactamente 10 dígitos
  if (cel && !/^\d{10}$/.test(cel)) {
    mostrarError('TelefonoCelular', 'Debe tener exactamente 10 dígitos numéricos.');
    ok = false;
  } else {
    limpiarError('TelefonoCelular');
  }

  // Email: si tiene algo, debe tener formato válido
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarError('Email', 'El formato del email no es válido.');
    ok = false;
  } else {
    limpiarError('Email');
  }

  return ok;
}

/* ── SECCIÓN 4: Datos Personales ── */
function validarSeccion4() {
  let ok = true;

  // Sexo: debe estar seleccionado
  const sexoSeleccionado = document.querySelector('input[name="Sexo"]:checked');
  if (!sexoSeleccionado) {
    mostrarError('Sexo', 'Seleccioná el sexo.');
    ok = false;
  } else {
    limpiarError('Sexo');
  }

  // Estado civil
  ok = validarNoVacio('EstadoCivil', 'Seleccioná el estado civil.') && ok;

  // Fecha de nacimiento
  const fnac = document.getElementById('FechaNacimiento').value;
  if (!fnac) {
    mostrarError('FechaNacimiento', 'La fecha de nacimiento es obligatoria.');
    ok = false;
  } else {
    limpiarError('FechaNacimiento');
    document.getElementById('FechaNacimiento').classList.add('ok');
  }

  return ok;
}

/* ── Validaciones específicas de campo ── */

/** Valida que un campo no esté vacío */
function validarNoVacio(id, mensaje) {
  const el = document.getElementById(id);
  if (!el) return true;
  const val = el.value.trim();
  if (!val) {
    mostrarError(id, mensaje);
    el.classList.add('error');
    el.classList.remove('ok');
    return false;
  }
  limpiarError(id);
  el.classList.remove('error');
  el.classList.add('ok');
  return true;
}

/** Valida el número de documento (solo números, entre 6 y 10 dígitos) */
function validarDNI() {
  const val = document.getElementById('NroDocumento').value.trim();
  if (!val) {
    mostrarError('NroDocumento', 'El número de documento es obligatorio.');
    return false;
  }
  if (!/^\d{6,10}$/.test(val)) {
    mostrarError('NroDocumento', 'Solo números, entre 6 y 10 dígitos.');
    return false;
  }
  limpiarError('NroDocumento');
  document.getElementById('NroDocumento').classList.add('ok');
  return true;
}

/**
 * Valida el CUIL.
 * Formatos válidos según la planilla:
 *  - Con guiones: XX-XXXXXXXX-X  (13 caracteres)
 *  - Sin guiones: XXXXXXXXXXX   (11 dígitos)
 */
function validarCuil() {
  const val = document.getElementById('CUIL').value.trim();
  if (!val) {
    mostrarError('CUIL', 'El CUIL es obligatorio.');
    return false;
  }
  const soloDigitos = val.replace(/\D/g, '');
  if (soloDigitos.length !== 11) {
    mostrarError('CUIL', 'El CUIL debe tener 11 dígitos (ej: 20-28690678-9).');
    return false;
  }
  limpiarError('CUIL');
  document.getElementById('CUIL').classList.add('ok');
  return true;
}

/* ── Helpers de errores ── */

function mostrarError(id, mensaje) {
  const errEl = document.getElementById('err-' + id);
  const inputEl = document.getElementById(id);
  if (errEl) errEl.textContent = mensaje;
  if (inputEl) {
    inputEl.classList.add('error');
    inputEl.classList.remove('ok');
  }
}

function limpiarError(id) {
  const errEl = document.getElementById('err-' + id);
  const inputEl = document.getElementById(id);
  if (errEl) errEl.textContent = '';
  if (inputEl) inputEl.classList.remove('error');
}


// ═══════════════════════════════════════════════════════════
// 4. HELPERS DE FORMATO EN TIEMPO REAL
// ═══════════════════════════════════════════════════════════

/**
 * Permite SOLO números en un campo.
 * Se llama con oninput="soloNumeros(this)"
 */
function soloNumeros(el) {
  // Guardamos la posición del cursor para no saltear caracteres
  const pos = el.selectionStart;
  el.value = el.value.replace(/\D/g, '');
  el.setSelectionRange(pos, pos);
}

/**
 * Permite solo letras, espacios y caracteres especiales del español.
 * Se llama con oninput="soloLetras(this)"
 */
function soloLetras(el) {
  // Convertimos a mayúsculas y eliminamos números
  const pos = el.selectionStart;
  el.value = el.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ\s'-]/g, '');
  el.setSelectionRange(pos, pos);
}

/**
 * Formatea el CUIL automáticamente mientras se escribe.
 * Ejemplo: 20286906789 → 20-28690678-9
 */
function formatearCuil(el) {
  // 1. Eliminar todo lo que no sea dígito
  let raw = el.value.replace(/\D/g, '').slice(0, 11);

  // 2. Agregar guiones en las posiciones correctas
  let formateado = raw;
  if (raw.length > 2) {
    formateado = raw.slice(0, 2) + '-' + raw.slice(2);
  }
  if (raw.length > 10) {
    formateado = raw.slice(0, 2) + '-' + raw.slice(2, 10) + '-' + raw.slice(10);
  }

  el.value = formateado;
}


// ═══════════════════════════════════════════════════════════
// 5. FAMILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Agrega un nuevo bloque de formulario para un familiar.
 * Cada bloque tiene su propio ID basado en el contador.
 */
function agregarFamiliar() {
  contadorFamiliares++;
  const id = contadorFamiliares;
  const contenedor = document.getElementById('familiares-lista');

  // Creamos el HTML del bloque
  const bloque = document.createElement('div');
  bloque.className = 'familiar-bloque';
  bloque.id = 'familiar-' + id;

  bloque.innerHTML = `
    <button class="btn-eliminar" type="button"
            onclick="eliminarFamiliar(${id})"
            title="Eliminar este familiar">✕</button>

    <div class="familiar-titulo">Familiar ${id}</div>

    <div class="form-grid">

      <div class="field-wrap col-4">
        <label>Nombre y Apellido del familiar</label>
        <input type="text" id="fam${id}-Nombre"
               placeholder="APELLIDO NOMBRE"
               oninput="soloLetras(this)" />
      </div>

      <div class="field-wrap col-2">
        <label>Parentesco</label>
        <!--
          Valores válidos según la planilla:
          H = HIJO, E = ESPOSO, U = UNIÓN CONVIVENCIAL
        -->
        <select id="fam${id}-Parentesco">
          <option value="">— Seleccioná —</option>
          <option value="H">Hijo/a</option>
          <option value="E">Esposo/a</option>
          <option value="U">Unión Convivencial</option>
        </select>
      </div>

      <div class="field-wrap col-2">
        <label>Tipo Documento</label>
        <select id="fam${id}-TipoDoc">
          <option value="DNI">DNI</option>
          <option value="CDI">CDI</option>
          <option value="LC">LC</option>
          <option value="LE">LE</option>
          <option value="TRAMITE">TRAMITE</option>
        </select>
      </div>

      <div class="field-wrap col-2">
        <label>Nº Documento</label>
        <input type="text" id="fam${id}-NroDoc"
               placeholder="28690678"
               maxlength="10"
               oninput="soloNumeros(this)" />
      </div>

      <div class="field-wrap col-2">
        <label>CUIL del familiar</label>
        <input type="text" id="fam${id}-CUIL"
               placeholder="20-XXXXXXXX-X"
               maxlength="13"
               oninput="formatearCuil(this)" />
      </div>

      <div class="field-wrap col-2">
        <label>Fecha de Nacimiento</label>
        <input type="date" id="fam${id}-FechaNac" />
      </div>

    </div>
  `;

  contenedor.appendChild(bloque);
  mostrarToast('Familiar agregado ✓');
}

/** Elimina el bloque de un familiar por su ID */
function eliminarFamiliar(id) {
  const bloque = document.getElementById('familiar-' + id);
  if (bloque) {
    bloque.style.opacity = '0';
    bloque.style.transform = 'translateY(-10px)';
    bloque.style.transition = 'all .3s';
    setTimeout(() => bloque.remove(), 300);
    mostrarToast('Familiar eliminado.');
  }
}

/**
 * Lee todos los bloques de familiares y devuelve un array de objetos.
 * @returns {Array<Object>}
 */
function recolectarFamiliares() {
  const lista = document.querySelectorAll('.familiar-bloque');
  const resultado = [];

  lista.forEach(bloque => {
    const idMatch = bloque.id.match(/familiar-(\d+)/);
    if (!idMatch) return;
    const id = idMatch[1];

    // Fecha: convertir de AAAA-MM-DD (HTML) a DD/MM/AAAA (planilla)
    const fechaRaw = document.getElementById(`fam${id}-FechaNac`)?.value || '';

    resultado.push({
      FamiliarNombre:              document.getElementById(`fam${id}-Nombre`)?.value.trim()    || '',
      FamiliarParentesco:          document.getElementById(`fam${id}-Parentesco`)?.value        || '',
      FamiliarTipoDocumentoCodigo: document.getElementById(`fam${id}-TipoDoc`)?.value           || '',
      FamiliarNroDocumento:        document.getElementById(`fam${id}-NroDoc`)?.value.trim()     || '',
      FamiliarCUIL:                document.getElementById(`fam${id}-CUIL`)?.value.trim()       || '',
      FamiliarFechaNacimiento:     fechaAFormato(fechaRaw),
    });
  });

  return resultado;
}


// ═══════════════════════════════════════════════════════════
// 6. DOCUMENTOS (DNI / LICENCIA)
// ═══════════════════════════════════════════════════════════

// ── FOTO CARNET ────────────────────────────────────────────

/**
 * Abre la cámara frontal para la foto carnet.
 *
 * Usamos la API del navegador: navigator.mediaDevices.getUserMedia()
 * Esta API pide permiso al usuario para acceder a la cámara.
 *
 * Configuración:
 *  - facingMode: "user"  → cámara frontal (selfie)
 *  - En celular Android/iOS abre la cámara delantera
 *  - En PC abre la webcam
 */
async function abrirCamaraCarnet() {
  const video     = document.getElementById('carnet-video');
  const guia      = document.getElementById('carnet-guia');
  const placeholder = document.getElementById('carnet-placeholder');
  const btnsInicio  = document.getElementById('carnet-btns-inicio');
  const btnsCamara  = document.getElementById('carnet-btns-camara');

  try {
    /*
      getUserMedia devuelve una "promesa" (Promise).
      La palabra "await" hace que JavaScript espere a que
      el usuario acepte el permiso antes de continuar.
    */
    streamCarnet = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',          // cámara frontal
        width:  { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false                   // no necesitamos audio
    });

    // Conectar el stream al elemento <video>
    video.srcObject = streamCarnet;

    // Mostrar video y guía de encuadre
    video.style.display    = 'block';
    guia.classList.add('visible');
    placeholder.style.display = 'none';

    // Cambiar botones: ocultar inicio, mostrar "Sacar foto / Cancelar"
    btnsInicio.style.display = 'none';
    btnsCamara.style.display = 'flex';

    mostrarToast('📷 Cámara activa — encuadrá tu rostro');

  } catch (error) {
    /*
      Errores comunes:
      - NotAllowedError   → el usuario rechazó el permiso
      - NotFoundError     → no hay cámara disponible
      - NotReadableError  → otra app está usando la cámara
    */
    console.error('Error al acceder a la cámara:', error);

    if (error.name === 'NotAllowedError') {
      mostrarToast('⚠️ Permiso de cámara denegado. Usá "Subir foto".', 'error');
    } else if (error.name === 'NotFoundError') {
      mostrarToast('⚠️ No se encontró cámara en el dispositivo.', 'error');
    } else {
      mostrarToast('⚠️ No se pudo acceder a la cámara. Usá "Subir foto".', 'error');
    }
  }
}

/**
 * Captura un fotograma del video y lo guarda como imagen.
 *
 * TÉCNICA: usamos un <canvas> invisible.
 * 1. Dibujamos el frame actual del video en el canvas.
 * 2. Convertimos el canvas a imagen (toDataURL / toBlob).
 * 3. Mostramos la imagen y apagamos la cámara.
 */
function capturarFotoCarnet() {
  const video   = document.getElementById('carnet-video');
  const canvas  = document.getElementById('carnet-canvas');
  const img     = document.getElementById('carnet-img');
  const guia    = document.getElementById('carnet-guia');
  const card    = document.getElementById('card-fotoCarnet');
  const statusEl = document.getElementById('status-fotoCarnet');
  const btnsCamara  = document.getElementById('carnet-btns-camara');
  const btnsRetomar = document.getElementById('carnet-btns-retomar');

  // Ajustar canvas al tamaño del video
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext('2d');

  /*
    EFECTO ESPEJO: el video está invertido en CSS (transform: scaleX(-1))
    para que se vea como un espejo. Para que la FOTO guardada también quede
    bien (no al revés), aplicamos el mismo efecto al canvas.
  */
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convertir canvas a Blob (archivo de imagen en memoria)
  canvas.toBlob(blob => {
    documentos.fotoCarnet = blob;   // Guardamos para descargar después

    // Mostrar la imagen capturada
    const urlTemporal = URL.createObjectURL(blob);
    img.src = urlTemporal;
    img.style.display = 'block';

    // Animación de flash (feedback visual de que se sacó la foto)
    img.style.opacity = '0';
    setTimeout(() => { img.style.transition = 'opacity .3s'; img.style.opacity = '1'; }, 50);

    // Ocultar video y guía
    video.style.display = 'none';
    guia.classList.remove('visible');

    // Apagar la cámara para liberar el hardware
    cerrarStreamCarnet();

    // Cambiar botones
    btnsCamara.style.display  = 'none';
    btnsRetomar.style.display = 'flex';

    // Marcar como completado
    statusEl.textContent = '✅ Foto capturada';
    card.classList.add('cargado');

    mostrarToast('✅ Foto carnet guardada', 'exito');

  }, 'image/jpeg', 0.92);   // formato JPEG, calidad 92%
}

/**
 * Cancela la cámara sin sacar foto.
 */
function cerrarCamaraCarnet() {
  cerrarStreamCarnet();

  const video       = document.getElementById('carnet-video');
  const guia        = document.getElementById('carnet-guia');
  const placeholder = document.getElementById('carnet-placeholder');
  const btnsInicio  = document.getElementById('carnet-btns-inicio');
  const btnsCamara  = document.getElementById('carnet-btns-camara');

  video.style.display       = 'none';
  guia.classList.remove('visible');
  placeholder.style.display = 'flex';
  btnsInicio.style.display  = 'flex';
  btnsCamara.style.display  = 'none';

  mostrarToast('Cámara cerrada.');
}

/**
 * Permite volver a sacar la foto (descarta la anterior).
 */
function retomarFotoCarnet() {
  const img         = document.getElementById('carnet-img');
  const placeholder = document.getElementById('carnet-placeholder');
  const btnsRetomar = document.getElementById('carnet-btns-retomar');
  const btnsInicio  = document.getElementById('carnet-btns-inicio');
  const card        = document.getElementById('card-fotoCarnet');
  const statusEl    = document.getElementById('status-fotoCarnet');

  // Limpiar foto anterior
  img.src = '';
  img.style.display = 'none';
  documentos.fotoCarnet = null;

  placeholder.style.display = 'flex';
  btnsRetomar.style.display = 'none';
  btnsInicio.style.display  = 'flex';
  card.classList.remove('cargado');
  statusEl.textContent = '⏳ Pendiente';
}

/**
 * Apaga el stream de la cámara (libera el hardware).
 * Importante: si no se hace esto, el indicador de cámara
 * del dispositivo sigue encendido aunque la página no la use.
 */
function cerrarStreamCarnet() {
  if (streamCarnet) {
    streamCarnet.getTracks().forEach(track => track.stop());
    streamCarnet = null;
  }
}

/**
 * Permite cargar la foto carnet desde un archivo del dispositivo
 * (en vez de usar la cámara).
 */
function cargarFotoCarnetDesdeArchivo(input) {
  if (!input.files || input.files.length === 0) return;

  const archivo = input.files[0];

  // Validar que sea imagen
  if (!archivo.type.startsWith('image/')) {
    mostrarToast('⚠️ Solo se aceptan imágenes para la foto carnet.', 'error');
    return;
  }

  documentos.fotoCarnet = archivo;

  const img         = document.getElementById('carnet-img');
  const placeholder = document.getElementById('carnet-placeholder');
  const card        = document.getElementById('card-fotoCarnet');
  const statusEl    = document.getElementById('status-fotoCarnet');
  const btnsRetomar = document.getElementById('carnet-btns-retomar');
  const btnsInicio  = document.getElementById('carnet-btns-inicio');

  const reader = new FileReader();
  reader.onload = e => {
    img.src = e.target.result;
    img.style.display   = 'block';
    placeholder.style.display = 'none';
    btnsInicio.style.display  = 'none';
    btnsRetomar.style.display = 'flex';
    card.classList.add('cargado');
    statusEl.textContent = '✅ ' + archivo.name;
    mostrarToast('✅ Foto cargada desde archivo', 'exito');
  };
  reader.readAsDataURL(archivo);
}

// Apagar cámara si el usuario navega a otra sección o cierra la página
window.addEventListener('beforeunload', cerrarStreamCarnet);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cerrarStreamCarnet();
});



/**
 * Previsualiza el documento seleccionado en el card correspondiente.
 * Si es imagen, muestra thumbnail. Si es PDF, muestra ícono.
 *
 * @param {HTMLInputElement} input - El input de tipo file
 * @param {string} docKey - Clave del documento ('dniFrente', etc.)
 */
function previsualizarDoc(input, docKey) {
  if (!input.files || input.files.length === 0) return;

  const archivo = input.files[0];
  documentos[docKey] = archivo;   // Guardamos para después descargarlo

  const prevDiv  = document.getElementById('prev-' + docKey);
  const statusEl = document.getElementById('status-' + docKey);
  const cardEl   = document.getElementById('card-' + docKey);

  if (archivo.type.startsWith('image/')) {
    // Si es imagen: mostramos thumbnail
    const reader = new FileReader();
    reader.onload = function(e) {
      prevDiv.innerHTML = `<img src="${e.target.result}" alt="Documento" />`;
    };
    reader.readAsDataURL(archivo);
  } else if (archivo.type === 'application/pdf') {
    // Si es PDF: mostramos ícono
    prevDiv.innerHTML = `<div style="padding:20px;font-size:32px">📄</div>`;
  }

  // Actualizar estado visual
  statusEl.textContent = '✅ ' + archivo.name;
  cardEl.classList.add('cargado');
  mostrarToast('Documento cargado: ' + archivo.name);

  // Sincronizar ambos inputs de ese documento (cámara y archivo)
  // para que el que no se usó también quede vacío y no confunda
}


// ═══════════════════════════════════════════════════════════
// 7. RECOLECCIÓN DE DATOS Y EXPORTACIÓN A EXCEL
// ═══════════════════════════════════════════════════════════

/**
 * Convierte una fecha de formato AAAA-MM-DD (HTML date input)
 * al formato DD/MM/AAAA que requiere la planilla.
 */
function fechaAFormato(fechaHtml) {
  if (!fechaHtml) return '';
  const partes = fechaHtml.split('-');
  if (partes.length !== 3) return fechaHtml;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Lee todos los campos del formulario y devuelve un objeto
 * con los datos del empleado listos para el Excel.
 */
function recolectarDatosEmpleado() {
  // Valor del radio button seleccionado
  const sexo = document.querySelector('input[name="Sexo"]:checked')?.value || '';
  const discapacitado = document.querySelector('input[name="Discapacitado"]:checked')?.value || '0';

  return {
    Apellido:              document.getElementById('Apellido').value.trim(),
    Nombre:                document.getElementById('Nombre').value.trim(),
    TipoDocumentoCodigo:   document.getElementById('TipoDocumentoCodigo').value,
    NroDocumento:          document.getElementById('NroDocumento').value.trim(),
    CUIL:                  document.getElementById('CUIL').value.trim(),
    // Domicilio
    Calle:                 document.getElementById('Calle').value.trim(),
    Nro:                   document.getElementById('Nro').value.trim(),
    Piso:                  document.getElementById('Piso').value.trim(),
    Dpto:                  document.getElementById('Dpto').value.trim(),
    Torre:                 document.getElementById('Torre').value.trim(),
    Localidad:             document.getElementById('Localidad').value.trim(),
    Provincia:             document.getElementById('Provincia').value.trim(),
    CodigoPostal:          document.getElementById('CodigoPostal').value.trim(),
    // Contacto
    TelefonoFijo:          document.getElementById('TelefonoFijo').value.trim(),
    TelefonoCelular:       document.getElementById('TelefonoCelular').value.trim(),
    Email:                 document.getElementById('Email').value.trim(),
    // Datos personales
    Sexo:                  sexo,
    EstadoCivil:           document.getElementById('EstadoCivil').value,
    FechaNacimiento:       fechaAFormato(document.getElementById('FechaNacimiento').value),
    Discapacitado:         discapacitado,
    // Campos fijos que pide la planilla (el administrador los completa luego)
    Activo:                '1',
    PaisCodigo:            'AR',
  };
}

/**
 * Función principal que se llama al presionar "Enviar".
 * 1. Valida la última sección.
 * 2. Recolecta todos los datos.
 * 3. Genera el archivo Excel (.xlsx) con SheetJS.
 * 4. Descarga el Excel.
 * 5. Descarga los documentos (si los hay).
 * 6. Muestra la pantalla de éxito.
 */
function enviarFormulario() {
  // Validar sección 6 (no hay campos obligatorios, pero avisamos)
  const docsSubidos = Object.values(documentos).filter(Boolean).length;
  if (docsSubidos === 0) {
    const confirmar = confirm(
      'No cargaste ningún documento (DNI/Licencia).\n¿Querés continuar de todas formas?'
    );
    if (!confirmar) return;
  }

  // Recolectar datos del empleado
  const empleado = recolectarDatosEmpleado();
  const familiares = recolectarFamiliares();

  // Construir filas para el Excel
  // Si no hay familiares → 1 fila
  // Si hay familiares → 1 fila por familiar (repitiendo datos del empleado)
  let filas = [];

  if (familiares.length === 0) {
    filas.push(empleado);
  } else {
    familiares.forEach(fam => {
      filas.push({
        ...empleado,
        FamiliarNombre:              fam.FamiliarNombre,
        FamiliarParentesco:          fam.FamiliarParentesco,
        FamiliarTipoDocumentoCodigo: fam.FamiliarTipoDocumentoCodigo,
        FamiliarNroDocumento:        fam.FamiliarNroDocumento,
        FamiliarCUIL:                fam.FamiliarCUIL,
        FamiliarFechaNacimiento:     fam.FamiliarFechaNacimiento,
      });
    });
  }

  // ── Generar Excel con SheetJS ──────────────────────────
  /*
    CÓMO FUNCIONA SHEETJS:
    1. XLSX.utils.json_to_sheet(array) → convierte array de objetos a hoja
    2. XLSX.utils.book_new()           → crea un libro vacío
    3. XLSX.utils.book_append_sheet()  → agrega la hoja al libro
    4. XLSX.writeFile()                → descarga el archivo
  */
  const hoja = XLSX.utils.json_to_sheet(filas);

  // Ajustar ancho de columnas automáticamente
  const anchos = Object.keys(filas[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  hoja['!cols'] = anchos;

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Padron');

  // Nombre del archivo: apellido_nombre_fecha.xlsx
  const hoy = new Date().toISOString().slice(0, 10); // AAAA-MM-DD
  const nombreArchivo = `INDUCRET_${empleado.Apellido}_${empleado.Nombre}_${hoy}.xlsx`
    .replace(/\s+/g, '_');

  XLSX.writeFile(libro, nombreArchivo);

  // ── Descargar documentos ───────────────────────────────
  /*
    LIMITACIÓN IMPORTANTE:
    Los navegadores no permiten guardar archivos en una carpeta específica
    por seguridad. Solo podemos descargar al directorio de descargas del usuario.

    En la instrucción al empleado explicamos que debe moverlos a la carpeta
    correcta, o bien, si usan Google Drive, pueden subir manualmente.

    Descargamos cada documento con un nombre descriptivo.
  */
  const nombreBase = `${empleado.Apellido}_${empleado.Nombre}`.replace(/\s+/g, '_');

  descargarDocumento(documentos.dniFrente,  `DNI_FRENTE_${nombreBase}`);
  descargarDocumento(documentos.dniDorso,   `DNI_DORSO_${nombreBase}`);
  descargarDocumento(documentos.licFrente,  `LIC_FRENTE_${nombreBase}`);
  descargarDocumento(documentos.licDorso,   `LIC_DORSO_${nombreBase}`);
  // La foto carnet puede ser un Blob (capturada con cámara) o un File (subido)
  descargarDocumento(documentos.fotoCarnet, `FOTO_CARNET_${nombreBase}`, 'jpg');

  // ── Mostrar pantalla de éxito ──────────────────────────
  document.getElementById('sec-' + seccionActual).classList.remove('active');
  document.getElementById('sec-ok').classList.add('active');
  document.getElementById('success-name').textContent =
    `${empleado.Apellido}, ${empleado.Nombre}`;

  mostrarToast('✅ Excel descargado correctamente', 'exito');
}

/**
 * Descarga un archivo (File o Blob) con un nombre dado.
 * Si el archivo es null o undefined, no hace nada.
 *
 * @param {File|Blob|null} archivo
 * @param {string} nombreBase      - Sin extensión
 * @param {string} extFallback     - Extensión a usar si el archivo es un Blob puro
 */
function descargarDocumento(archivo, nombreBase, extFallback = 'jpg') {
  if (!archivo) return;

  /*
    File tiene la propiedad .name, Blob no.
    Para la foto capturada con cámara tenemos un Blob (no File),
    por eso usamos el extFallback.
  */
  const ext = archivo.name
    ? archivo.name.split('.').pop()
    : extFallback;

  const nombre = `${nombreBase}.${ext}`;

  // Crear URL temporal para descarga
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  // Liberar memoria
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Reinicia el formulario para una nueva carga */
function nuevoFormulario() {
  location.reload();
}


// ═══════════════════════════════════════════════════════════
// 8. CÓDIGO QR
// ═══════════════════════════════════════════════════════════

let qrGenerado = false;

function toggleQR() {
  const qrBox = document.getElementById('qr-box');
  const visible = qrBox.style.display !== 'none';

  if (visible) {
    qrBox.style.display = 'none';
  } else {
    qrBox.style.display = 'block';
    if (!qrGenerado) generarQR();
  }
}

/**
 * Genera el QR con la URL actual de la página.
 * En producción (GitHub Pages) usará la URL pública real.
 */
function generarQR() {
  const url = window.location.href;
  document.getElementById('qr-url').textContent = url;

  // QRCode.js genera el QR dentro del div #qr-code
  new QRCode(document.getElementById('qr-code'), {
    text: url,
    width:  160,
    height: 160,
    colorDark: '#1B4F9B',     // Azul Inducret
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M
  });

  qrGenerado = true;
}

function imprimirQR() {
  const contenido = document.getElementById('qr-box').innerHTML;
  const ventana = window.open('', '', 'width=400,height=500');
  ventana.document.write(`
    <html>
    <body style="display:flex;flex-direction:column;align-items:center;
                 font-family:sans-serif;padding:30px;gap:12px;">
      <h2 style="color:#1B4F9B">INDUCRET – Alta de Empleado</h2>
      <p>Escaneá el QR para completar el formulario</p>
      ${contenido}
    </body>
    </html>
  `);
  ventana.print();
}


// ═══════════════════════════════════════════════════════════
// 9. TOAST (notificaciones)
// ═══════════════════════════════════════════════════════════

let toastTimer = null;

/**
 * Muestra una notificación flotante temporaria.
 * @param {string} mensaje
 * @param {'exito'|'error'|''} tipo
 */
function mostrarToast(mensaje, tipo = '') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = 'toast show ' + tipo;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
