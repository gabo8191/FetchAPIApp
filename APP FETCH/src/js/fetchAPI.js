document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});


// ════════════════════════════════════════════════════════════
//  FUNCIONALIDAD 1 – PETICIÓN GET
// ════════════════════════════════════════════════════════════

const ENDPOINT  = 'https://jsonplaceholder.typicode.com/users';
const MAX_USERS = 30; 

const dotGet    = document.getElementById('dot-get');
const textGet   = document.getElementById('text-get');
const errorGet  = document.getElementById('error-get');
const tableWrap = document.getElementById('table-wrap');
const tbody     = document.getElementById('tbody');

fetch(ENDPOINT)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();           
  })
  .then(usuarios => {
    const lista = usuarios.slice(0, MAX_USERS);


    dotGet.classList.add('done');
    const nota = usuarios.length < MAX_USERS
      ? ` (la API devuelve ${usuarios.length} en total)`
      : '';
    textGet.textContent =
      `${lista.length} usuario(s) cargados correctamente · 200 OK${nota}`;

    console.log('GET usuarios:', lista);

    lista.forEach((u, i) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${i * 40}ms`;
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="name-cell">${u.name}</td>
        <td class="email-cell">${u.email}</td>
        <td class="phone-cell">${u.phone}</td>
        <td class="company-cell">${u.company.name}</td>
        <td class="website-cell">
          <a href="https://${u.website}" target="_blank" rel="noopener">${u.website}</a>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tableWrap.style.display = 'block';
  })
  .catch(error => {
    dotGet.classList.add('error');
    textGet.textContent      = 'La solicitud falló.';
    errorGet.style.display   = 'block';
    errorGet.textContent     = `⚠ ${error.message}`;
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
  { ruta: './img/fine.png',   cardId: 'card-red',   imgId: 'img-red',   dotId: 'dot-red',   infoId: 'info-red'   },
  { ruta: './img/homero.png', cardId: 'card-fetch', imgId: 'img-fetch', dotId: 'dot-fetch', infoId: 'info-fetch' },
];

// ── Cargar una imagen con Blob ───────────────────────────────
function cargarBlob(imagen) {
  logMsg(`[FETCH] Solicitando: ${imagen.ruta}`);

  const card = document.getElementById(imagen.cardId);
  const img  = document.getElementById(imagen.imgId);
  const dot  = document.getElementById(imagen.dotId);
  const info = document.getElementById(imagen.infoId);

  fetch(imagen.ruta)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} · ${imagen.ruta}`);
      }
      logMsg(`[RESPONSE] ${imagen.ruta} → ${response.status} OK`, 'ok');
      return response.blob();           
    })
    .then(blob => {
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

      logMsg(`[BLOB]  type: ${blob.type} | size: ${fmtBytes(blob.size)}`, 'warn');
      logMsg(`[URL]   ${objectURL}`, 'ok');
    })
    .catch(error => {
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
    .then(response => {
      const responseClonada = response.clone();
      logMsg('[CLONE] response.clone() ejecutado', 'ok');

      // Imagen A ← respuesta original
      response.blob().then(blob => {
        imgA.src = URL.createObjectURL(blob);
        imgA.classList.add('loaded');
        logMsg('[CLONE] Imagen A ← response original', 'ok');
      });

      // Imagen B
      responseClonada.blob().then(blob => {
        imgB.src = URL.createObjectURL(blob);
        imgB.classList.add('loaded');
        logMsg('[CLONE] Imagen B ← responseClonada', 'ok');
      });
    })
    .catch(error => logMsg(`[CLONE ERROR] ${error.message}`, 'err'));
}

logMsg('Fetch API + Blob · iniciando…');
IMAGENES.forEach(img => cargarBlob(img));
setTimeout(demoClone, 600);  