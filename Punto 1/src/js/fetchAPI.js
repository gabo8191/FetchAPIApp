
const ENDPOINT  = 'https://jsonplaceholder.typicode.com/users';
const MAX_USERS = 30;   

const dot        = document.getElementById('dot');
const statusText = document.getElementById('status-text');
const tableWrap  = document.getElementById('table-wrap');
const tbody      = document.getElementById('tbody');
const errorMsg   = document.getElementById('error-msg');

fetch(ENDPOINT)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(usuarios => {
    const lista = usuarios.slice(0, MAX_USERS);
    console.log('Total recibido de la API:', usuarios.length);  
    console.log('Datos:', lista); 

    // Actualizar indicador
    dot.classList.add('done');
    const nota = usuarios.length < MAX_USERS
      ? ` (la API devuelve ${usuarios.length} en total)`
      : '';
    statusText.textContent =
      `${lista.length} usuario(s) cargados correctamente · 200 OK${nota}`;

    // Construir filas de la tabla
    lista.forEach((usuario, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 40}ms`;

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td class="name-cell">${usuario.name}</td>
        <td class="email-cell">${usuario.email}</td>
        <td class="phone-cell">${usuario.phone}</td>
        <td class="company-cell">${usuario.company.name}</td>
        <td class="website-cell">
          <a href="https://${usuario.website}" target="_blank" rel="noopener">
            ${usuario.website}
          </a>
        </td>
      `;

      tbody.appendChild(tr);
    });

    //Tabla
    tableWrap.style.display = 'block';
  })
  .catch(error => {
    dot.classList.add('error');
    statusText.textContent = 'La solicitud falló.';

    errorMsg.style.display = 'block';
    errorMsg.textContent   = `${error.message}`;

    console.error('Fetch API – error:', error);
  });