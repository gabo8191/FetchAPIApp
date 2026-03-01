document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.tab-btn')
      .forEach((b) => b.classList.remove('active'));
    document
      .querySelectorAll('.tab-panel')
      .forEach((p) => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ════════════════════════════════════════════════════════════
//  FUNCIONALIDAD 1 – PETICIÓN GET
// ════════════════════════════════════════════════════════════

const ENDPOINT = 'https://jsonplaceholder.typicode.com/users';
const MAX_USERS = 30;

const dotGet = document.getElementById('dot-get');
const textGet = document.getElementById('text-get');
const errorGet = document.getElementById('error-get');
const tableWrap = document.getElementById('table-wrap');
const tbody = document.getElementById('tbody');
const userDetail = document.getElementById('user-detail');
const detailTitle = document.getElementById('detail-title');

// Almacena los usuarios cargados para acceso posterior
let usuariosCargados = [];

// Variables para funcionalidad PATCH
let usuarioActualEnEdicion = null;
let datosOriginales = null;

// ── Mostrar detalle del usuario ──────────────────────────────
function mostrarDetalle(usuario) {
  console.log('────────────────────────────────────────');
  console.log('Detalle del usuario seleccionado:', usuario);

  // Guardar referencia del usuario en edición
  usuarioActualEnEdicion = usuario;
  datosOriginales = JSON.parse(JSON.stringify(usuario)); // Deep copy

  detailTitle.textContent = usuario.name;

  // Campos editables y sus valores
  const campos = {
    'detail-name': usuario.name,
    'detail-username': usuario.username,
    'detail-email': usuario.email,
    'detail-phone': usuario.phone,
    'detail-website': usuario.website,
    'detail-company': usuario.company.name,
    'detail-catchphrase': usuario.company.catchPhrase,
    'detail-bs': usuario.company.bs,
    'detail-street': usuario.address.street,
    'detail-suite': usuario.address.suite,
    'detail-city': usuario.address.city,
    'detail-zipcode': usuario.address.zipcode,
  };

  Object.entries(campos).forEach(([id, valor]) => {
    const input = document.getElementById(id);
    input.value = valor;
  });

  // Limpiar estados anteriores
  if (patchStatus) patchStatus.style.display = 'none';
  if (errorPatch) errorPatch.style.display = 'none';
  if (dotPatch) dotPatch.className = 'dot';

  userDetail.style.display = 'block';
  userDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });

  console.log('Datos cargados en el formulario de detalle (12 campos):');
  console.table(campos);
}

fetch(ENDPOINT)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then((usuarios) => {
    const lista = usuarios.slice(0, MAX_USERS);
    usuariosCargados = lista;

    dotGet.classList.add('done');
    const nota =
      usuarios.length < MAX_USERS
        ? ` (la API devuelve ${usuarios.length} en total)`
        : '';
    textGet.textContent = `${lista.length} usuario(s) cargados correctamente · 200 OK${nota}`;

    console.log('GET usuarios:', lista);

    lista.forEach((u, i) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${i * 40}ms`;
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="name-cell">
          <a href="#user-detail" data-user-index="${i}">${u.name}</a>
        </td>
        <td class="email-cell">${u.email}</td>
        <td class="phone-cell">${u.phone}</td>
        <td class="company-cell">${u.company.name}</td>
        <td class="website-cell">
          <a href="https://${u.website}" target="_blank" rel="noopener">${u.website}</a>
        </td>
        <td class="actions-cell">
          <button class="btn-delete" data-user-index="${i}" data-user-id="${u.id}" title="Eliminar usuario">
            🗑️
          </button>
        </td>
      `;

      // Agregar evento click al enlace del nombre
      tr.querySelector('.name-cell a').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarDetalle(usuariosCargados[i]);
      });

      // Agregar evento click al botón DELETE
      tr.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.preventDefault();
        const userIndex = parseInt(e.target.dataset.userIndex);
        const userId = parseInt(e.target.dataset.userId);
        eliminarUsuario(userId, userIndex);
      });

      tbody.appendChild(tr);
    });

    tableWrap.style.display = 'block';
  })
  .catch((error) => {
    dotGet.classList.add('error');
    textGet.textContent = 'La solicitud falló.';
    errorGet.style.display = 'block';
    errorGet.textContent = `⚠ ${error.message}`;
    console.error('GET error:', error);
  });

// ════════════════════════════════════════════════════════════
//  FUNCIONALIDAD 2 – BLOB (imágenes)
// ════════════════════════════════════════════════════════════

function logMsg(texto, tipo = 'info') {
  tipo === 'err' ? console.error(texto) : console.log(texto);
}

// ── Utilidad: formatear bytes ────────────────────────────────
function fmtBytes(b) {
  return b < 1024 ? `${b} bytes` : `${(b / 1024).toFixed(2)} KB`;
}

const IMAGENES = [
  {
    ruta: './img/fine.png',
    cardId: 'card-red',
    imgId: 'img-red',
    dotId: 'dot-red',
    infoId: 'info-red',
  },
  {
    ruta: './img/homero.png',
    cardId: 'card-fetch',
    imgId: 'img-fetch',
    dotId: 'dot-fetch',
    infoId: 'info-fetch',
  },
];

// ── Cargar una imagen con Blob ───────────────────────────────
function cargarBlob(imagen) {
  logMsg(`[FETCH] Solicitando: ${imagen.ruta}`);

  const card = document.getElementById(imagen.cardId);
  const img = document.getElementById(imagen.imgId);
  const dot = document.getElementById(imagen.dotId);
  const info = document.getElementById(imagen.infoId);

  fetch(imagen.ruta)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} · ${imagen.ruta}`);
      }
      logMsg(`[RESPONSE] ${imagen.ruta} → ${response.status} OK`, 'ok');
      return response.blob();
    })
    .then((blob) => {
      const objectURL = URL.createObjectURL(blob);

      img.src = objectURL;
      dot.classList.add('done');
      card.classList.add('loaded');

      // Mostrar metadata del Blob
      info.innerHTML = `
        <span class="bi-row"><span class="bi-label">Tipo:</span>   <span class="bi-value">${blob.type}</span></span>
        <span class="bi-row"><span class="bi-label">Tamaño:</span> <span class="bi-value">${fmtBytes(blob.size)}</span></span>
        <span class="bi-row"><span class="bi-label">URL:</span>    <span class="bi-value">${objectURL.substring(0, 38)}…</span></span>
      `;

      logMsg(
        `[BLOB]  type: ${blob.type} | size: ${fmtBytes(blob.size)}`,
        'warn',
      );
      logMsg(`[URL]   ${objectURL}`, 'ok');
    })
    .catch((error) => {
      dot.classList.add('error');
      logMsg(`[ERROR] ${error.message}`, 'err');
    });
}

// ── Demo Response.clone() ────────────────────────────────────
function demoClone() {
  logMsg('──────────────────────────────────────');
  logMsg('[CLONE] Iniciando demo Response.clone()…');

  const imgA = document.getElementById('clone-a');
  const imgB = document.getElementById('clone-b');

  fetch(new Request('./img/fine.png'))
    .then((response) => {
      const responseClonada = response.clone();
      logMsg('[CLONE] response.clone() ejecutado', 'ok');

      // Imagen A ← respuesta original
      response.blob().then((blob) => {
        imgA.src = URL.createObjectURL(blob);
        imgA.classList.add('loaded');
        logMsg('[CLONE] Imagen A ← response original', 'ok');
      });

      // Imagen B
      responseClonada.blob().then((blob) => {
        imgB.src = URL.createObjectURL(blob);
        imgB.classList.add('loaded');
        logMsg('[CLONE] Imagen B ← responseClonada', 'ok');
      });
    })
    .catch((error) => logMsg(`[CLONE ERROR] ${error.message}`, 'err'));
}

logMsg('Fetch API + Blob · iniciando…');
IMAGENES.forEach((img) => cargarBlob(img));
setTimeout(demoClone, 600);

// ════════════════════════════════════════════════════════════
//  FUNCIONALIDAD 3 – PETICIÓN PATCH (editar usuario)
// ════════════════════════════════════════════════════════════

const btnSaveUser = document.getElementById('btn-save-user');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const patchStatus = document.getElementById('patch-status');
const dotPatch = document.getElementById('dot-patch');
const textPatch = document.getElementById('text-patch');
const errorPatch = document.getElementById('error-patch');

// ── Recopilar datos del formulario ──
function recopilarDatosFormulario() {
  const inputs = document.querySelectorAll('#detail-form input[data-key]');
  const datos = {};
  
  inputs.forEach(input => {
    const key = input.getAttribute('data-key');
    const value = input.value.trim();
    
    // Construir objeto anidado
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!datos[parent]) datos[parent] = {};
      datos[parent][child] = value;
    } else {
      datos[key] = value;
    }
  });
  
  // Agregar ID del usuario
  datos.id = usuarioActualEnEdicion.id;
  
  return datos;
}

// ── Validar datos del formulario ──
function validarDatos(datos) {
  const errores = [];
  
  if (!datos.name || datos.name.length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push('El email debe tener un formato válido');
  }
  
  if (!datos.username || datos.username.length < 2) {
    errores.push('El username debe tener al menos 2 caracteres');
  }
  
  return errores;
}

// ── Actualizar tabla con nuevos datos ──
function actualizarTabla(datosActualizados) {
  // Encontrar el índice del usuario en la lista
  const usuarioIndex = usuariosCargados.findIndex(u => u.id === datosActualizados.id);
  
  if (usuarioIndex !== -1) {
    // Actualizar los datos en la lista
    usuariosCargados[usuarioIndex] = { ...usuariosCargados[usuarioIndex], ...datosActualizados };
    
    // Actualizar la fila en la tabla
    const filaTabla = tbody.children[usuarioIndex];
    if (filaTabla) {
      filaTabla.children[1].innerHTML = `<a href="#user-detail" data-user-index="${usuarioIndex}">${datosActualizados.name}</a>`;
      filaTabla.children[2].textContent = datosActualizados.email;
      filaTabla.children[3].textContent = datosActualizados.phone;
      filaTabla.children[4].textContent = datosActualizados.company.name;
      filaTabla.children[5].innerHTML = `<a href="https://${datosActualizados.website}" target="_blank" rel="noopener">${datosActualizados.website}</a>`;
      
      // Re-agregar event listener
      filaTabla.querySelector('.name-cell a').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarDetalle(usuariosCargados[usuarioIndex]);
      });
      
      // Efecto visual de actualización
      filaTabla.style.background = 'var(--green)';
      filaTabla.style.color = 'white';
      setTimeout(() => {
        filaTabla.style.background = '';
        filaTabla.style.color = '';
      }, 1500);
    }
  }
}

// ── Función principal PATCH ──
async function guardarCambios() {
  try {
    // Recopilar datos del formulario
    const datosActualizados = recopilarDatosFormulario();
    
    console.log('────────────────────────────────────────');
    console.log('PATCH - Datos a enviar:', datosActualizados);
    
    // Validar datos
    const errores = validarDatos(datosActualizados);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }
    
    // Mostrar estado de carga
    patchStatus.style.display = 'block';
    errorPatch.style.display = 'none';
    textPatch.textContent = 'Enviando cambios al servidor...';
    dotPatch.className = 'dot loading';
    btnSaveUser.disabled = true;
    
    // Realizar petición PATCH
    const response = await fetch(`${ENDPOINT}/${usuarioActualEnEdicion.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosActualizados)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const resultado = await response.json();
    
    // Mostrar éxito
    dotPatch.className = 'dot done';
    textPatch.textContent = `Usuario actualizado correctamente · ${response.status} OK`;
    
    console.log('PATCH exitoso - Respuesta del servidor:', resultado);
    console.log('Estado HTTP:', response.status);
    
    // Actualizar la tabla con los nuevos datos
    actualizarTabla(datosActualizados);
    
    // Log detallado de los cambios
    console.log('────────────────────────────────────────');
    console.log('CAMBIOS REALIZADOS:');
    console.table({
      'Nombre original': datosOriginales.name,
      'Nombre nuevo': datosActualizados.name,
      'Email original': datosOriginales.email,
      'Email nuevo': datosActualizados.email,
      'Teléfono original': datosOriginales.phone,
      'Teléfono nuevo': datosActualizados.phone,
      'Compañía original': datosOriginales.company.name,
      'Compañía nueva': datosActualizados.company.name,
      'Website original': datosOriginales.website,
      'Website nuevo': datosActualizados.website
    });
    
    // Ocultar status después de 3 segundos
    setTimeout(() => {
      patchStatus.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    dotPatch.className = 'dot error';
    textPatch.textContent = 'Error al guardar cambios';
    errorPatch.style.display = 'block';
    errorPatch.textContent = `⚠ ${error.message}`;
    
    console.error('PATCH error:', error);
  } finally {
    btnSaveUser.disabled = false;
  }
}

// ── Cancelar edición ──
function cancelarEdicion() {
  if (datosOriginales) {
    // Restaurar datos originales
    mostrarDetalle(datosOriginales);
    console.log('Edición cancelada - Datos restaurados');
  } else {
    userDetail.style.display = 'none';
    console.log('Edición cancelada - Formulario cerrado');
  }
}

// ════════════════════════════════════════════════════════════
//  FUNCIONALIDAD 4 – PETICIÓN DELETE (eliminar usuario)
// ════════════════════════════════════════════════════════════

const deleteStatus = document.getElementById('delete-status');
const dotDelete = document.getElementById('dot-delete');
const textDelete = document.getElementById('text-delete');
const errorDelete = document.getElementById('error-delete');

async function eliminarUsuario(userId, userIndex) {
  console.log('════════════════════════════════════════');
  console.log('INICIANDO ELIMINACIÓN DE USUARIO');
  console.log('────────────────────────────────────────');
  console.log('ID del usuario a eliminar:', userId);
  console.log('Índice en la tabla:', userIndex);
  
  // Mostrar confirmación
  const usuario = usuariosCargados[userIndex];
  if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${usuario.name}"?`)) {
    console.log('Eliminación cancelada por el usuario');
    return;
  }

  // Mostrar status de carga
  deleteStatus.style.display = 'block';
  errorDelete.style.display = 'none';
  dotDelete.className = 'dot';
  textDelete.textContent = 'Eliminando usuario...';

  try {
    console.log('Enviando petición DELETE al endpoint:', `${ENDPOINT}/${userId}`);
    
    const response = await fetch(`${ENDPOINT}/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (response.ok) {
      // Eliminación exitosa
      dotDelete.classList.add('success');
      textDelete.textContent = 'Usuario eliminado correctamente';
      
      console.log('✅ Usuario eliminado exitosamente');
      console.log('Usuario eliminado:', usuario);
      
      // Remover de la tabla visualmente
      const filaTabla = tbody.children[userIndex];
      if (filaTabla) {
        filaTabla.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          filaTabla.remove();
          actualizarNumerosTabla();
        }, 300);
      }
      
      // Remover del array de usuarios cargados
      usuariosCargados.splice(userIndex, 1);
      
      // Cerrar detalle si el usuario eliminado estaba siendo editado
      if (usuarioActualEnEdicion && usuarioActualEnEdicion.id === userId) {
        userDetail.style.display = 'none';
        usuarioActualEnEdicion = null;
        datosOriginales = null;
        console.log('Detalle de usuario cerrado (usuario eliminado)');
      }
      
      setTimeout(() => {
        deleteStatus.style.display = 'none';
      }, 2000);
      
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    
    dotDelete.classList.add('error');
    textDelete.textContent = 'Error al eliminar usuario';
    errorDelete.style.display = 'block';
    errorDelete.textContent = `⚠ ${error.message}`;
    
    setTimeout(() => {
      deleteStatus.style.display = 'none';
      errorDelete.style.display = 'none';
    }, 3000);
  }
  
  console.log('════════════════════════════════════════');
}

// Función auxiliar para actualizar números de fila después de eliminar
function actualizarNumerosTabla() {
  Array.from(tbody.children).forEach((tr, index) => {
    tr.children[0].textContent = index + 1;
    
    // Actualizar índices en los eventos
    const nameLink = tr.querySelector('.name-cell a');
    const deleteBtn = tr.querySelector('.btn-delete');
    
    if (nameLink) nameLink.dataset.userIndex = index;
    if (deleteBtn) deleteBtn.dataset.userIndex = index;
  });
}

// ── Event listeners ──
btnSaveUser.addEventListener('click', guardarCambios);
btnCancelEdit.addEventListener('click', cancelarEdicion);
