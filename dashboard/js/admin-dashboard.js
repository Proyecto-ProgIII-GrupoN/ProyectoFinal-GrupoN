// Dashboard Administrador - BREAD de Reservas

// Nota: API_BASE_URL ya está definido en auth.js

// Estado global
let reservasData = [];
let salonesData = [];
let turnosData = [];
let clientesData = [];
let serviciosData = [];
let reservaEditando = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!auth || !auth.getToken() || !auth.getUser() || auth.getUser().tipo_usuario !== 1) {
        auth.logout();
        return;
    }

    // Inicializar nombre de usuario
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = auth.getUser().nombre;
    }

    // Inicializar navegación
    initNavigation();

    // Inicializar botones de logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => auth.logout());
    document.getElementById('logoutBtnTop')?.addEventListener('click', () => auth.logout());

    // Cargar datos iniciales
    loadReservas();
    loadSalones();
    loadTurnos();
    loadClientes();
    loadServicios();
    
    // Cargar estadísticas solo si la sección está activa al cargar la página
    // No cargar automáticamente para evitar llamadas múltiples
    const estadisticasSection = document.getElementById('section-estadisticas');
    if (estadisticasSection && estadisticasSection.classList.contains('active')) {
        // Delay pequeño para asegurar que todo está inicializado
        setTimeout(() => {
            loadEstadisticas();
        }, 100);
    }

    // Event listeners - Reservas
    document.getElementById('btnNuevaReserva')?.addEventListener('click', () => abrirModalReserva());
    document.getElementById('btnCerrarModal')?.addEventListener('click', () => cerrarModalReserva());
    document.getElementById('btnCancelarReserva')?.addEventListener('click', () => cerrarModalReserva());
    document.getElementById('searchReservas')?.addEventListener('input', filtrarReservas);
    document.getElementById('filterEstado')?.addEventListener('change', filtrarReservas);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
    document.getElementById('formReserva')?.addEventListener('submit', guardarReserva);
    document.getElementById('btnRefrescarEstadisticas')?.addEventListener('click', () => loadEstadisticas());

    // Event listeners - Salones
    document.getElementById('btnNuevoSalon')?.addEventListener('click', () => abrirModalSalon());
    document.getElementById('btnCerrarModalSalon')?.addEventListener('click', () => cerrarModalSalon());
    document.getElementById('btnCancelarSalon')?.addEventListener('click', () => cerrarModalSalon());
    document.getElementById('searchSalones')?.addEventListener('input', filtrarSalones);
    document.getElementById('filterEstadoSalon')?.addEventListener('change', filtrarSalones);
    document.getElementById('btnLimpiarFiltrosSalones')?.addEventListener('click', limpiarFiltrosSalones);
    document.getElementById('formSalon')?.addEventListener('submit', guardarSalon);

    // Event listeners - Servicios
    document.getElementById('btnNuevoServicio')?.addEventListener('click', () => abrirModalServicio());
    document.getElementById('btnCerrarModalServicio')?.addEventListener('click', () => cerrarModalServicio());
    document.getElementById('btnCancelarServicio')?.addEventListener('click', () => cerrarModalServicio());
    document.getElementById('searchServicios')?.addEventListener('input', filtrarServicios);
    document.getElementById('filterEstadoServicio')?.addEventListener('change', filtrarServicios);
    document.getElementById('btnLimpiarFiltrosServicios')?.addEventListener('click', limpiarFiltrosServicios);
    document.getElementById('formServicio')?.addEventListener('submit', guardarServicio);

    // Event listeners - Turnos
    document.getElementById('btnNuevoTurno')?.addEventListener('click', () => abrirModalTurno());
    document.getElementById('btnCerrarModalTurno')?.addEventListener('click', () => cerrarModalTurno());
    document.getElementById('btnCancelarTurno')?.addEventListener('click', () => cerrarModalTurno());
    document.getElementById('filterEstadoTurno')?.addEventListener('change', filtrarTurnos);
    document.getElementById('btnLimpiarFiltrosTurnos')?.addEventListener('click', limpiarFiltrosTurnos);
    document.getElementById('formTurno')?.addEventListener('submit', guardarTurno);

    // Event listeners - Usuarios
    document.getElementById('btnNuevoUsuario')?.addEventListener('click', () => abrirModalUsuario());
    document.getElementById('btnCerrarModalUsuario')?.addEventListener('click', () => cerrarModalUsuario());
    document.getElementById('btnCancelarUsuario')?.addEventListener('click', () => cerrarModalUsuario());
    document.getElementById('searchUsuarios')?.addEventListener('input', filtrarUsuarios);
    document.getElementById('filterTipoUsuario')?.addEventListener('change', filtrarUsuarios);
    document.getElementById('filterEstadoUsuario')?.addEventListener('change', filtrarUsuarios);
    document.getElementById('btnLimpiarFiltrosUsuarios')?.addEventListener('click', limpiarFiltrosUsuarios);
    document.getElementById('formUsuario')?.addEventListener('submit', guardarUsuario);

    // Event listeners - Informes
    document.getElementById('btnGenerarPDF')?.addEventListener('click', () => generarInforme('pdf'));
    document.getElementById('btnGenerarCSV')?.addEventListener('click', () => generarInforme('csv'));
});

// ===== NAVEGACIÓN =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    let isNavigating = false;
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isNavigating) return;
            isNavigating = true;
            
            const section = item.getAttribute('data-section');
            
            // Actualizar clases activas
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección
            showSection(section);
            
            // Actualizar hash sin disparar hashchange
            const currentHash = window.location.hash.substring(1);
            if (currentHash !== section) {
                window.history.replaceState(null, '', `#${section}`);
            }
            
            setTimeout(() => {
                isNavigating = false;
            }, 100);
        });
    });
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const section = document.getElementById(`section-${sectionName}`);
    if (section) {
        section.classList.add('active');
        
        const titles = {
            'reservas': 'Reservas',
            'usuarios': 'Usuarios',
            'salones': 'Salones',
            'servicios': 'Servicios',
            'turnos': 'Turnos',
            'estadisticas': 'Estadísticas',
            'informes': 'Informes'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }
        
        // Cargar datos cuando se muestra cada sección
        if (sectionName === 'estadisticas' && !isLoadingEstadisticas) {
            loadEstadisticas();
        } else if (sectionName === 'salones') {
            loadSalones();
        } else if (sectionName === 'servicios') {
            loadServicios();
        } else if (sectionName === 'turnos') {
            loadTurnos();
        } else if (sectionName === 'usuarios') {
            loadUsuarios();
        }
    }
}

// ===== RESERVAS - BREAD =====

// BROWSE - Listar reservas
async function loadReservas() {
    const container = document.getElementById('reservasTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando reservas...</p></div>';
    
    try {
        const response = await auth.fetch('/reservas?limit=100');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Debug
        
        if (data.estado && data.datos) {
            reservasData = Array.isArray(data.datos) ? data.datos : [];
            console.log('Reservas cargadas:', reservasData.length); // Debug
            renderReservasTable(reservasData);
        } else {
            container.innerHTML = '<p class="empty-state">No hay reservas disponibles</p>';
        }
    } catch (error) {
        console.error('Error cargando reservas:', error);
        container.innerHTML = `<p class="error-message">Error al cargar reservas: ${error.message}</p>`;
    }
}

function renderReservasTable(reservas) {
    const container = document.getElementById('reservasTable');
    
    if (!reservas || reservas.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron reservas</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Salón</th>
                    <th>Turno</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    reservas.forEach(reserva => {
        // Formatear fecha
        let fecha = 'N/A';
        if (reserva.fecha_reserva) {
            try {
                const fechaObj = new Date(reserva.fecha_reserva);
                fecha = fechaObj.toLocaleDateString('es-AR');
            } catch (e) {
                fecha = reserva.fecha_reserva;
            }
        }
        
        // Obtener nombre del cliente
        const clienteNombre = reserva.usuario_nombre || reserva.cliente_nombre || 'N/A';
        
        // Obtener título del salón
        const salonTitulo = reserva.salon_titulo || 'N/A';
        
        // Formatear turno
        let turnoHorario = 'N/A';
        if (reserva.hora_desde && reserva.hora_hasta) {
            turnoHorario = `${reserva.hora_desde.substring(0, 5)} - ${reserva.hora_hasta.substring(0, 5)}`;
        }
        
        const estado = reserva.activo === 1 ? 
            '<span class="badge badge-success">Activa</span>' : 
            '<span class="badge badge-danger">Inactiva</span>';
        
        html += `
            <tr>
                <td>${reserva.reserva_id}</td>
                <td>${fecha}</td>
                <td>${clienteNombre}</td>
                <td>${salonTitulo}</td>
                <td>${turnoHorario}</td>
                <td>${formatCurrency(reserva.importe_total || 0)}</td>
                <td>${estado}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-view" onclick="verReserva(${reserva.reserva_id})" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editarReserva(${reserva.reserva_id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="eliminarReserva(${reserva.reserva_id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// READ - Ver detalles de reserva
async function verReserva(id) {
    try {
        const response = await auth.fetch(`/reservas/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const reserva = data.datos;
            // Mostrar modal con detalles
            alert(`Reserva #${reserva.reserva_id}\nFecha: ${reserva.fecha_reserva}\nCliente: ${reserva.cliente_nombre}\nSalón: ${reserva.salon_titulo}\nTotal: ${formatCurrency(reserva.importe_total)}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles de la reserva');
    }
}

// EDIT - Editar reserva
async function editarReserva(id) {
    try {
        const response = await auth.fetch(`/reservas/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            reservaEditando = data.datos;
            abrirModalReserva(data.datos);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la reserva para editar');
    }
}

// DELETE - Eliminar reserva
async function eliminarReserva(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
        return;
    }
    
    try {
        const response = await auth.fetch(`/reservas/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.estado) {
            alert('Reserva eliminada correctamente');
            loadReservas();
        } else {
            alert(data.mensaje || 'Error al eliminar la reserva');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la reserva');
    }
}

// ADD - Abrir modal para nueva reserva
async function abrirModalReserva(reserva = null) {
    reservaEditando = reserva;
    const modal = document.getElementById('modalReserva');
    const form = document.getElementById('formReserva');
    
    // Asegurar que los datos estén cargados
    if (salonesData.length === 0) await loadSalones();
    if (turnosData.length === 0) await loadTurnos();
    if (clientesData.length === 0) await loadClientes();
    if (serviciosData.length === 0) await loadServicios();
    
    if (reserva) {
        document.getElementById('modalReservaTitle').textContent = 'Editar Reserva';
        document.getElementById('reserva_id').value = reserva.reserva_id;
        document.getElementById('fecha_reserva').value = reserva.fecha_reserva.split('T')[0];
        document.getElementById('salon_id').value = reserva.salon_id;
        document.getElementById('turno_id').value = reserva.turno_id;
        document.getElementById('usuario_id').value = reserva.usuario_id;
        document.getElementById('tematica').value = reserva.tematica || '';
        
        // Cargar servicios de la reserva si existen
        if (reserva.servicios && reserva.servicios.length > 0) {
            reserva.servicios.forEach(serv => {
                const checkbox = document.querySelector(`#serviciosContainer input[value="${serv.servicio_id}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        document.getElementById('modalReservaTitle').textContent = 'Nueva Reserva';
        form.reset();
        document.getElementById('reserva_id').value = '';
        // Desmarcar todos los checkboxes
        document.querySelectorAll('#serviciosContainer input[type="checkbox"]').forEach(cb => cb.checked = false);
    }
    
    modal.classList.add('active');
}

function cerrarModalReserva() {
    document.getElementById('modalReserva').classList.remove('active');
    reservaEditando = null;
    document.getElementById('modalError').style.display = 'none';
}

// Guardar reserva (CREATE/UPDATE)
async function guardarReserva(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('modalError');
    errorDiv.style.display = 'none';
    
    const formData = {
        fecha_reserva: document.getElementById('fecha_reserva').value,
        salon_id: parseInt(document.getElementById('salon_id').value),
        turno_id: parseInt(document.getElementById('turno_id').value),
        usuario_id: parseInt(document.getElementById('usuario_id').value),
        tematica: document.getElementById('tematica').value || null
    };
    
    // Obtener servicios seleccionados con sus importes
    const serviciosSeleccionados = Array.from(document.querySelectorAll('#serviciosContainer input[type="checkbox"]:checked'))
        .map(cb => {
            const servicioId = parseInt(cb.value);
            const servicio = serviciosData.find(s => s.servicio_id === servicioId);
            return {
                servicio_id: servicioId,
                importe: servicio ? parseFloat(servicio.importe) : 0
            };
        });
    
    if (serviciosSeleccionados.length > 0) {
        formData.servicios = serviciosSeleccionados;
    }
    
    try {
        const reservaId = document.getElementById('reserva_id').value;
        let response;
        
        if (reservaId) {
            // UPDATE
            response = await auth.fetch(`/reservas/${reservaId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            // CREATE
            response = await auth.fetch('/reservas', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }
        
        const data = await response.json();
        
        if (data.estado) {
            alert(reservaId ? 'Reserva actualizada correctamente' : 'Reserva creada correctamente');
            cerrarModalReserva();
            loadReservas();
        } else {
            errorDiv.textContent = data.mensaje || 'Error al guardar la reserva';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión o servidor';
        errorDiv.style.display = 'block';
    }
}

// ===== CARGAR DATOS PARA FORMULARIOS =====
async function loadSalones() {
    try {
        const response = await auth.fetch('/salones?limit=100');
        const data = await response.json();
        if (data.estado && data.datos) {
            salonesData = data.datos;
            // Cargar en select si existe (para formularios de reservas)
            const select = document.getElementById('salon_id');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar salón...</option>' +
                    salonesData.map(s => `<option value="${s.salon_id}">${s.titulo} - ${formatCurrency(s.importe)}</option>`).join('');
            }
            // Cargar en tabla si existe (para sección de salones)
            const table = document.getElementById('salonesTable');
            if (table) {
                renderSalonesTable(salonesData);
            }
        }
    } catch (error) {
        console.error('Error cargando salones:', error);
        const table = document.getElementById('salonesTable');
        if (table) {
            table.innerHTML = `<p class="error-message">Error al cargar salones: ${error.message}</p>`;
        }
    }
}

async function loadTurnos() {
    try {
        const response = await auth.fetch('/turnos?limit=100');
        const data = await response.json();
        if (data.estado && data.datos) {
            turnosData = data.datos;
            // Cargar en select si existe (para formularios de reservas)
            const select = document.getElementById('turno_id');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar turno...</option>' +
                    turnosData.map(t => `<option value="${t.turno_id}">${t.hora_desde} - ${t.hora_hasta}</option>`).join('');
            }
            // Cargar en tabla si existe (para sección de turnos)
            const table = document.getElementById('turnosTable');
            if (table) {
                renderTurnosTable(turnosData);
            }
        }
    } catch (error) {
        console.error('Error cargando turnos:', error);
        const table = document.getElementById('turnosTable');
        if (table) {
            table.innerHTML = `<p class="error-message">Error al cargar turnos: ${error.message}</p>`;
        }
    }
}

async function loadClientes() {
    try {
        const response = await auth.fetch('/usuarios/clientes?limit=100');
        const data = await response.json();
        if (data.estado && data.datos) {
            clientesData = data.datos;
            const select = document.getElementById('usuario_id');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar cliente...</option>' +
                    clientesData.map(c => `<option value="${c.usuario_id}">${c.nombre} ${c.apellido} (${c.nombre_usuario})</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        // Si falla, intentar con el endpoint de todos los usuarios (solo admin)
        try {
            const response = await auth.fetch('/usuarios?limit=100');
            const data = await response.json();
            if (data.estado && data.datos) {
                // Filtrar solo clientes (tipo_usuario = 3)
                clientesData = data.datos.filter(u => u.tipo_usuario === 3);
                const select = document.getElementById('usuario_id');
                if (select) {
                    select.innerHTML = '<option value="">Seleccionar cliente...</option>' +
                        clientesData.map(c => `<option value="${c.usuario_id}">${c.nombre} ${c.apellido} (${c.nombre_usuario})</option>`).join('');
                }
            }
        } catch (error2) {
            console.error('Error cargando usuarios:', error2);
        }
    }
}

async function loadServicios() {
    try {
        const response = await auth.fetch('/servicios?limit=100');
        const data = await response.json();
        if (data.estado && data.datos) {
            serviciosData = data.datos;
            // Cargar en checkboxes si existe (para formularios de reservas)
            const container = document.getElementById('serviciosContainer');
            if (container) {
                container.innerHTML = serviciosData.map(s => `
                    <label class="checkbox-label">
                        <input type="checkbox" value="${s.servicio_id}" name="servicios[]">
                        <span>${s.descripcion} - ${formatCurrency(s.importe)}</span>
                    </label>
                `).join('');
            }
            // Cargar en tabla si existe (para sección de servicios)
            const table = document.getElementById('serviciosTable');
            if (table) {
                renderServiciosTable(serviciosData);
            }
        }
    } catch (error) {
        console.error('Error cargando servicios:', error);
        const table = document.getElementById('serviciosTable');
        if (table) {
            table.innerHTML = `<p class="error-message">Error al cargar servicios: ${error.message}</p>`;
        }
    }
}

// ===== FILTROS =====
function filtrarReservas() {
    const search = document.getElementById('searchReservas').value.toLowerCase();
    const estado = document.getElementById('filterEstado').value;
    
    let filtradas = reservasData;
    
    if (search) {
        filtradas = filtradas.filter(r => 
            (r.cliente_nombre && r.cliente_nombre.toLowerCase().includes(search)) ||
            (r.salon_titulo && r.salon_titulo.toLowerCase().includes(search)) ||
            (r.reserva_id && r.reserva_id.toString().includes(search))
        );
    }
    
    if (estado !== '') {
        filtradas = filtradas.filter(r => r.activo === parseInt(estado));
    }
    
    renderReservasTable(filtradas);
}

function limpiarFiltros() {
    document.getElementById('searchReservas').value = '';
    document.getElementById('filterEstado').value = '';
    renderReservasTable(reservasData);
}

// ===== UTILIDADES =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}

// ===== ESTADÍSTICAS =====
let isLoadingEstadisticas = false;
let charts = {}; // Objeto para almacenar las instancias de gráficos

async function loadEstadisticas() {
    if (isLoadingEstadisticas) {
        console.log('⚠️ Estadísticas ya se están cargando, ignorando llamada duplicada');
        return;
    }
    
    isLoadingEstadisticas = true;
    console.log('✅ Iniciando carga de estadísticas...');
    
    try {
        // Cargar todas las estadísticas en paralelo
        await Promise.all([
            loadEstadisticasGenerales(),
            loadEstadisticasSalones(),
            loadEstadisticasPeriodo(),
            loadEstadisticasServicios(),
            loadEstadisticasClientes()
        ]);
        console.log('✅ Estadísticas cargadas completamente');
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    } finally {
        isLoadingEstadisticas = false;
    }
}

async function loadEstadisticasGenerales() {
    const container = document.getElementById('estadisticasGenerales');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando estadísticas...</p></div>';
    
    try {
        console.log('Cargando estadísticas generales...');
        const response = await auth.fetch('/estadisticas?tipo=general');
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: No se pudieron cargar las estadísticas.`;
            try {
                // Intentar leer el texto primero
                const responseText = await response.text();
                console.error('Error HTTP:', response.status, responseText);
                
                // Intentar parsear como JSON
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.mensaje || errorMessage;
                } catch (e) {
                    // No es JSON, usar el texto directamente
                    if (response.status === 401) {
                        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                    } else if (response.status === 403) {
                        errorMessage = 'No tienes permisos para ver las estadísticas.';
                    } else if (response.status === 500) {
                        errorMessage = 'Error del servidor. Verifica que el servidor esté ejecutándose correctamente.';
                    }
                }
            } catch (e) {
                // Error al leer la respuesta
                if (response.status === 401) {
                    errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                } else if (response.status === 403) {
                    errorMessage = 'No tienes permisos para ver las estadísticas.';
                } else if (response.status === 500) {
                    errorMessage = 'Error del servidor. Verifica que el servidor esté ejecutándose correctamente.';
                }
            }
            container.innerHTML = `<p class="error-message">${errorMessage}</p>`;
            return;
        }
        
        const data = await response.json();
        
        console.log('Respuesta de estadísticas generales:', data);
        
        if (data.estado && data.datos) {
            const stats = data.datos;
            renderEstadisticasGenerales(stats);
        } else {
            console.error('No hay datos de estadísticas:', data);
            const errorMsg = data.mensaje || 'No hay estadísticas disponibles';
            container.innerHTML = `<p class="empty-state">${errorMsg}</p>`;
        }
    } catch (error) {
        console.error('Error cargando estadísticas generales:', error);
        let errorMessage = 'Error al cargar estadísticas';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Error de conexión: No se pudo conectar al servidor. Verifica que el servidor esté ejecutándose en http://localhost:3000';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Error al procesar la respuesta del servidor';
        }
        
        container.innerHTML = `<p class="error-message">${errorMessage}</p>`;
    }
}

function renderEstadisticasGenerales(stats) {
    const container = document.getElementById('estadisticasGenerales');
    
    console.log('Renderizando estadísticas generales:', stats);
    
    const totalReservas = stats.total_reservas || 0;
    const totalIngresos = parseFloat(stats.total_ingresos) || 0;
    const promedioMensual = parseFloat(stats.promedio_reservas_mes) || 0;
    const clientesActivos = stats.total_clientes_activos || 0;
    const salonesActivos = stats.total_salones_activos || 0;
    
    const html = `
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
                <h3>${totalReservas}</h3>
                <p>Total Reservas</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
                <h3>${formatCurrency(totalIngresos)}</h3>
                <p>Total Ingresos</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-content">
                <h3>${promedioMensual.toFixed(2)}</h3>
                <p>Promedio Mensual</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
                <h3>${clientesActivos}</h3>
                <p>Clientes Activos</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <i class="fas fa-building"></i>
            </div>
            <div class="stat-content">
                <h3>${salonesActivos}</h3>
                <p>Salones Activos</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('Estadísticas renderizadas correctamente');
}

async function loadEstadisticasSalones() {
    const container = document.getElementById('estadisticasSalones');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando...</p></div>';
    
    try {
        console.log('Cargando estadísticas por salón...');
        const response = await auth.fetch('/estadisticas?tipo=salones');
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: No se pudieron cargar las estadísticas por salón.`;
            try {
                // Intentar leer el texto primero
                const responseText = await response.text();
                console.error('Error HTTP:', response.status, responseText);
                
                // Intentar parsear como JSON
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.mensaje || errorMessage;
                } catch (e) {
                    // No es JSON, usar el texto directamente
                    if (response.status === 401) {
                        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                    } else if (response.status === 403) {
                        errorMessage = 'No tienes permisos para ver las estadísticas.';
                    } else if (response.status === 500) {
                        errorMessage = 'Error del servidor. Verifica que el servidor esté ejecutándose correctamente.';
                    }
                }
            } catch (e) {
                // Error al leer la respuesta
                if (response.status === 401) {
                    errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                } else if (response.status === 403) {
                    errorMessage = 'No tienes permisos para ver las estadísticas.';
                } else if (response.status === 500) {
                    errorMessage = 'Error del servidor. Verifica que el servidor esté ejecutándose correctamente.';
                }
            }
            container.innerHTML = `<p class="error-message">${errorMessage}</p>`;
            return;
        }
        
        const data = await response.json();
        
        console.log('Respuesta de estadísticas por salón:', data);
        
        if (data.estado && data.datos) {
            renderEstadisticasSalones(data.datos);
            // También renderizar el gráfico de ingresos por salón
            renderChartIngresosSalones(data.datos);
        } else {
            const errorMsg = data.mensaje || 'No hay estadísticas por salón disponibles';
            container.innerHTML = `<p class="empty-state">${errorMsg}</p>`;
        }
    } catch (error) {
        console.error('Error cargando estadísticas por salón:', error);
        let errorMessage = 'Error al cargar estadísticas por salón';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Error de conexión: No se pudo conectar al servidor';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Error al procesar la respuesta del servidor';
        }
        
        container.innerHTML = `<p class="error-message">${errorMessage}</p>`;
    }
}

function renderEstadisticasSalones(salones) {
    const container = document.getElementById('estadisticasSalones');
    
    if (!salones || salones.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay estadísticas por salón disponibles</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th><i class="fas fa-building"></i> Salón</th>
                    <th><i class="fas fa-calendar-check"></i> Total Reservas</th>
                    <th><i class="fas fa-dollar-sign"></i> Total Ingresos</th>
                    <th><i class="fas fa-chart-line"></i> Promedio por Reserva</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    salones.forEach((salon, index) => {
        const totalIngresos = parseFloat(salon.total_ingresos) || 0;
        const promedioReserva = parseFloat(salon.promedio_por_reserva) || 0;
        const cantidadReservas = salon.cantidad_reservas || 0;
        
        // Determinar si el salón tiene actividad
        const tieneActividad = cantidadReservas > 0;
        const rowClass = tieneActividad ? 'stat-row-active' : 'stat-row-inactive';
        
        html += `
            <tr class="${rowClass}" style="animation-delay: ${index * 0.05}s;">
                <td><strong>${salon.salon_titulo || 'N/A'}</strong></td>
                <td>
                    ${tieneActividad ? 
                        `<span class="stat-badge stat-badge-info">${cantidadReservas}</span>` : 
                        `<span class="stat-badge stat-badge-muted">${cantidadReservas}</span>`
                    }
                </td>
                <td>
                    <span class="stat-amount ${tieneActividad ? 'stat-amount-success' : ''}">${formatCurrency(totalIngresos)}</span>
                </td>
                <td>
                    <span class="stat-amount ${tieneActividad ? 'stat-amount-primary' : ''}">${formatCurrency(promedioReserva)}</span>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== FUNCIONES PARA CARGAR ESTADÍSTICAS ADICIONALES =====

async function loadEstadisticasPeriodo() {
    try {
        console.log('Cargando estadísticas por período...');
        const response = await auth.fetch('/estadisticas?tipo=periodos');
        
        if (!response.ok) {
            console.error('Error cargando estadísticas por período:', response.status);
            return;
        }
        
        const data = await response.json();
        
        if (data.estado && data.datos && Array.isArray(data.datos) && data.datos.length > 0) {
            renderChartReservasPeriodo(data.datos);
        }
    } catch (error) {
        console.error('Error cargando estadísticas por período:', error);
    }
}

async function loadEstadisticasServicios() {
    try {
        console.log('Cargando estadísticas de servicios...');
        const response = await auth.fetch('/estadisticas?tipo=servicios');
        
        if (!response.ok) {
            console.error('Error cargando estadísticas de servicios:', response.status);
            return;
        }
        
        const data = await response.json();
        
        if (data.estado && data.datos && Array.isArray(data.datos) && data.datos.length > 0) {
            renderChartServicios(data.datos);
        }
    } catch (error) {
        console.error('Error cargando estadísticas de servicios:', error);
    }
}

async function loadEstadisticasClientes() {
    try {
        console.log('Cargando estadísticas de clientes...');
        const response = await auth.fetch('/estadisticas?tipo=clientes');
        
        if (!response.ok) {
            console.error('Error cargando estadísticas de clientes:', response.status);
            return;
        }
        
        const data = await response.json();
        
        if (data.estado && data.datos && Array.isArray(data.datos) && data.datos.length > 0) {
            renderChartClientes(data.datos);
        }
    } catch (error) {
        console.error('Error cargando estadísticas de clientes:', error);
    }
}

// ===== FUNCIONES PARA RENDERIZAR GRÁFICOS =====

function renderChartReservasPeriodo(datos) {
    // Ordenar por período (más antiguo primero)
    const datosOrdenados = [...datos].sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        return a.mes - b.mes;
    });
    
    const labels = datosOrdenados.map(d => {
        // Formatear fecha: "Enero 2025"
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${meses[d.mes - 1]} ${d.anio}`;
    });
    
    const reservas = datosOrdenados.map(d => d.cantidad_reservas || 0);
    const ingresos = datosOrdenados.map(d => parseFloat(d.total_ingresos || 0));
    
    const ctx = document.getElementById('chartReservasPeriodo');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (charts.reservasPeriodo) {
        charts.reservasPeriodo.destroy();
    }
    
    charts.reservasPeriodo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reservas',
                data: reservas,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
            }, {
                label: 'Ingresos',
                data: ingresos,
                borderColor: 'rgb(240, 147, 251)',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Reservas: ${context.parsed.y}`;
                            } else {
                                return `Ingresos: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cantidad de Reservas'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Ingresos (ARS)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function renderChartIngresosSalones(datos) {
    // Ordenar por ingresos (mayor a menor)
    const datosOrdenados = [...datos].sort((a, b) => {
        const ingA = parseFloat(a.total_ingresos || 0);
        const ingB = parseFloat(b.total_ingresos || 0);
        return ingB - ingA;
    });
    
    const labels = datosOrdenados.map(d => d.salon_titulo || 'Sin nombre');
    const ingresos = datosOrdenados.map(d => parseFloat(d.total_ingresos || 0));
    
    // Colores gradientes
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(255, 206, 84, 0.8)'
    ];
    
    const ctx = document.getElementById('chartIngresosSalones');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (charts.ingresosSalones) {
        charts.ingresosSalones.destroy();
    }
    
    charts.ingresosSalones = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ingresos Totales',
                data: ingresos,
                backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                borderColor: labels.map((_, i) => colors[i % colors.length].replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Ingresos: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ingresos (ARS)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function renderChartServicios(datos) {
    // Tomar los top 10 servicios
    const topServicios = datos.slice(0, 10);
    
    const labels = topServicios.map(d => d.servicio_descripcion || 'Sin nombre');
    const veces = topServicios.map(d => d.veces_contratado || 0);
    
    // Colores para el gráfico de pastel
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(255, 206, 84, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)'
    ];
    
    const ctx = document.getElementById('chartServicios');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (charts.servicios) {
        charts.servicios.destroy();
    }
    
    charts.servicios = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: veces,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = veces.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} veces (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderChartClientes(datos) {
    // Tomar los top 10 clientes
    const topClientes = datos.slice(0, 10);
    
    const labels = topClientes.map(d => {
        const nombre = d.cliente_nombre || 'Sin nombre';
        return nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre;
    });
    const reservas = topClientes.map(d => d.cantidad_reservas || 0);
    
    // Colores gradientes
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(255, 206, 84, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)'
    ];
    
    const ctx = document.getElementById('chartClientes');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (charts.clientes) {
        charts.clientes.destroy();
    }
    
    charts.clientes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reservas',
                data: reservas,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y', // Gráfico horizontal
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Reservas: ${context.parsed.x}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de Reservas'
                    }
                }
            }
        }
    });
}

// ===== SALONES - BREAD =====
let salonesTableData = [];

function renderSalonesTable(salones) {
    const container = document.getElementById('salonesTable');
    if (!container) return;
    
    salonesTableData = salones;
    
    if (!salones || salones.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron salones</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Dirección</th>
                    <th>Capacidad</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    salones.forEach(salon => {
        const estado = salon.activo === 1 ? 
            '<span class="badge badge-success">Activo</span>' : 
            '<span class="badge badge-danger">Inactivo</span>';
        
        html += `
            <tr>
                <td>${salon.salon_id}</td>
                <td><strong>${salon.titulo || 'N/A'}</strong></td>
                <td>${salon.direccion || 'N/A'}</td>
                <td>${salon.capacidad || 'N/A'}</td>
                <td>${formatCurrency(salon.importe || 0)}</td>
                <td>${estado}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-view" onclick="verSalon(${salon.salon_id})" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editarSalon(${salon.salon_id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="eliminarSalon(${salon.salon_id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function verSalon(id) {
    try {
        const response = await auth.fetch(`/salones/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const salon = data.datos;
            alert(`Salón: ${salon.titulo}\nDirección: ${salon.direccion}\nCapacidad: ${salon.capacidad || 'N/A'}\nImporte: ${formatCurrency(salon.importe)}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del salón');
    }
}

async function editarSalon(id) {
    try {
        const response = await auth.fetch(`/salones/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            abrirModalSalon(data.datos);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el salón para editar');
    }
}

async function eliminarSalon(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este salón?')) {
        return;
    }
    
    try {
        const response = await auth.fetch(`/salones/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.estado) {
            alert('Salón eliminado correctamente');
            loadSalones();
        } else {
            alert(data.mensaje || 'Error al eliminar el salón');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el salón');
    }
}

function abrirModalSalon(salon = null) {
    const modal = document.getElementById('modalSalon');
    const form = document.getElementById('formSalon');
    
    if (salon) {
        document.getElementById('modalSalonTitle').textContent = 'Editar Salón';
        document.getElementById('salon_id_modal').value = salon.salon_id;
        document.getElementById('salon_titulo').value = salon.titulo || '';
        document.getElementById('salon_direccion').value = salon.direccion || '';
        document.getElementById('salon_importe').value = salon.importe || '';
        document.getElementById('salon_capacidad').value = salon.capacidad || '';
        document.getElementById('salon_latitud').value = salon.latitud || '';
        document.getElementById('salon_longitud').value = salon.longitud || '';
    } else {
        document.getElementById('modalSalonTitle').textContent = 'Nuevo Salón';
        form.reset();
        document.getElementById('salon_id_modal').value = '';
    }
    
    document.getElementById('modalErrorSalon').style.display = 'none';
    modal.classList.add('active');
}

function cerrarModalSalon() {
    document.getElementById('modalSalon').classList.remove('active');
    document.getElementById('modalErrorSalon').style.display = 'none';
}

async function guardarSalon(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('modalErrorSalon');
    errorDiv.style.display = 'none';
    
    const formData = {
        titulo: document.getElementById('salon_titulo').value,
        direccion: document.getElementById('salon_direccion').value,
        importe: parseFloat(document.getElementById('salon_importe').value),
        capacidad: document.getElementById('salon_capacidad').value ? parseInt(document.getElementById('salon_capacidad').value) : null,
        latitud: document.getElementById('salon_latitud').value ? parseFloat(document.getElementById('salon_latitud').value) : null,
        longitud: document.getElementById('salon_longitud').value ? parseFloat(document.getElementById('salon_longitud').value) : null
    };
    
    try {
        const salonId = document.getElementById('salon_id_modal').value;
        let response;
        
        if (salonId) {
            response = await auth.fetch(`/salones/${salonId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            response = await auth.fetch('/salones', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }
        
        const data = await response.json();
        
        if (data.estado) {
            alert(salonId ? 'Salón actualizado correctamente' : 'Salón creado correctamente');
            cerrarModalSalon();
            loadSalones();
        } else {
            errorDiv.textContent = data.mensaje || 'Error al guardar el salón';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión o servidor';
        errorDiv.style.display = 'block';
    }
}

function filtrarSalones() {
    const search = document.getElementById('searchSalones').value.toLowerCase();
    const estado = document.getElementById('filterEstadoSalon').value;
    
    let filtrados = salonesTableData;
    
    if (search) {
        filtrados = filtrados.filter(s => 
            (s.titulo && s.titulo.toLowerCase().includes(search)) ||
            (s.direccion && s.direccion.toLowerCase().includes(search)) ||
            (s.salon_id && s.salon_id.toString().includes(search))
        );
    }
    
    if (estado !== '') {
        filtrados = filtrados.filter(s => s.activo === parseInt(estado));
    }
    
    renderSalonesTable(filtrados);
}

function limpiarFiltrosSalones() {
    document.getElementById('searchSalones').value = '';
    document.getElementById('filterEstadoSalon').value = '';
    renderSalonesTable(salonesTableData);
}

// ===== SERVICIOS - BREAD =====
let serviciosTableData = [];

function renderServiciosTable(servicios) {
    const container = document.getElementById('serviciosTable');
    if (!container) return;
    
    serviciosTableData = servicios;
    
    if (!servicios || servicios.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron servicios</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    servicios.forEach(servicio => {
        const estado = servicio.activo === 1 ? 
            '<span class="badge badge-success">Activo</span>' : 
            '<span class="badge badge-danger">Inactivo</span>';
        
        html += `
            <tr>
                <td>${servicio.servicio_id}</td>
                <td><strong>${servicio.descripcion || 'N/A'}</strong></td>
                <td>${formatCurrency(servicio.importe || 0)}</td>
                <td>${estado}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-view" onclick="verServicio(${servicio.servicio_id})" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editarServicio(${servicio.servicio_id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="eliminarServicio(${servicio.servicio_id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function verServicio(id) {
    try {
        const response = await auth.fetch(`/servicios/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const servicio = data.datos;
            alert(`Servicio: ${servicio.descripcion}\nImporte: ${formatCurrency(servicio.importe)}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del servicio');
    }
}

async function editarServicio(id) {
    try {
        const response = await auth.fetch(`/servicios/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            abrirModalServicio(data.datos);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el servicio para editar');
    }
}

async function eliminarServicio(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
        return;
    }
    
    try {
        const response = await auth.fetch(`/servicios/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.estado) {
            alert('Servicio eliminado correctamente');
            loadServicios();
        } else {
            alert(data.mensaje || 'Error al eliminar el servicio');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el servicio');
    }
}

function abrirModalServicio(servicio = null) {
    const modal = document.getElementById('modalServicio');
    const form = document.getElementById('formServicio');
    
    if (servicio) {
        document.getElementById('modalServicioTitle').textContent = 'Editar Servicio';
        document.getElementById('servicio_id_modal').value = servicio.servicio_id;
        document.getElementById('servicio_descripcion').value = servicio.descripcion || '';
        document.getElementById('servicio_importe').value = servicio.importe || '';
    } else {
        document.getElementById('modalServicioTitle').textContent = 'Nuevo Servicio';
        form.reset();
        document.getElementById('servicio_id_modal').value = '';
    }
    
    document.getElementById('modalErrorServicio').style.display = 'none';
    modal.classList.add('active');
}

function cerrarModalServicio() {
    document.getElementById('modalServicio').classList.remove('active');
    document.getElementById('modalErrorServicio').style.display = 'none';
}

async function guardarServicio(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('modalErrorServicio');
    errorDiv.style.display = 'none';
    
    const formData = {
        descripcion: document.getElementById('servicio_descripcion').value,
        importe: parseFloat(document.getElementById('servicio_importe').value)
    };
    
    try {
        const servicioId = document.getElementById('servicio_id_modal').value;
        let response;
        
        if (servicioId) {
            response = await auth.fetch(`/servicios/${servicioId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            response = await auth.fetch('/servicios', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }
        
        const data = await response.json();
        
        if (data.estado) {
            alert(servicioId ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
            cerrarModalServicio();
            loadServicios();
        } else {
            errorDiv.textContent = data.mensaje || 'Error al guardar el servicio';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión o servidor';
        errorDiv.style.display = 'block';
    }
}

function filtrarServicios() {
    const search = document.getElementById('searchServicios').value.toLowerCase();
    const estado = document.getElementById('filterEstadoServicio').value;
    
    let filtrados = serviciosTableData;
    
    if (search) {
        filtrados = filtrados.filter(s => 
            (s.descripcion && s.descripcion.toLowerCase().includes(search)) ||
            (s.servicio_id && s.servicio_id.toString().includes(search))
        );
    }
    
    if (estado !== '') {
        filtrados = filtrados.filter(s => s.activo === parseInt(estado));
    }
    
    renderServiciosTable(filtrados);
}

function limpiarFiltrosServicios() {
    document.getElementById('searchServicios').value = '';
    document.getElementById('filterEstadoServicio').value = '';
    renderServiciosTable(serviciosTableData);
}

// ===== TURNOS - BREAD =====
let turnosTableData = [];

function renderTurnosTable(turnos) {
    const container = document.getElementById('turnosTable');
    if (!container) return;
    
    turnosTableData = turnos;
    
    if (!turnos || turnos.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron turnos</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Orden</th>
                    <th>Hora Desde</th>
                    <th>Hora Hasta</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    turnos.forEach(turno => {
        const estado = turno.activo === 1 ? 
            '<span class="badge badge-success">Activo</span>' : 
            '<span class="badge badge-danger">Inactivo</span>';
        
        const horaDesde = turno.hora_desde ? turno.hora_desde.substring(0, 5) : 'N/A';
        const horaHasta = turno.hora_hasta ? turno.hora_hasta.substring(0, 5) : 'N/A';
        
        html += `
            <tr>
                <td>${turno.turno_id}</td>
                <td><strong>${turno.orden || 'N/A'}</strong></td>
                <td>${horaDesde}</td>
                <td>${horaHasta}</td>
                <td>${estado}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-view" onclick="verTurno(${turno.turno_id})" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editarTurno(${turno.turno_id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="eliminarTurno(${turno.turno_id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function verTurno(id) {
    try {
        const response = await auth.fetch(`/turnos/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const turno = data.datos;
            const horaDesde = turno.hora_desde ? turno.hora_desde.substring(0, 5) : 'N/A';
            const horaHasta = turno.hora_hasta ? turno.hora_hasta.substring(0, 5) : 'N/A';
            alert(`Turno: Orden ${turno.orden}\nHorario: ${horaDesde} - ${horaHasta}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del turno');
    }
}

async function editarTurno(id) {
    try {
        const response = await auth.fetch(`/turnos/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            abrirModalTurno(data.datos);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el turno para editar');
    }
}

async function eliminarTurno(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este turno?')) {
        return;
    }
    
    try {
        const response = await auth.fetch(`/turnos/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.estado) {
            alert('Turno eliminado correctamente');
            loadTurnos();
        } else {
            alert(data.mensaje || 'Error al eliminar el turno');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el turno');
    }
}

function abrirModalTurno(turno = null) {
    const modal = document.getElementById('modalTurno');
    const form = document.getElementById('formTurno');
    
    if (turno) {
        document.getElementById('modalTurnoTitle').textContent = 'Editar Turno';
        document.getElementById('turno_id_modal').value = turno.turno_id;
        document.getElementById('turno_orden').value = turno.orden || '';
        // Formatear horas para input type="time"
        document.getElementById('turno_hora_desde').value = turno.hora_desde ? turno.hora_desde.substring(0, 5) : '';
        document.getElementById('turno_hora_hasta').value = turno.hora_hasta ? turno.hora_hasta.substring(0, 5) : '';
    } else {
        document.getElementById('modalTurnoTitle').textContent = 'Nuevo Turno';
        form.reset();
        document.getElementById('turno_id_modal').value = '';
    }
    
    document.getElementById('modalErrorTurno').style.display = 'none';
    modal.classList.add('active');
}

function cerrarModalTurno() {
    document.getElementById('modalTurno').classList.remove('active');
    document.getElementById('modalErrorTurno').style.display = 'none';
}

async function guardarTurno(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('modalErrorTurno');
    errorDiv.style.display = 'none';
    
    let horaDesde = document.getElementById('turno_hora_desde').value;
    let horaHasta = document.getElementById('turno_hora_hasta').value;
    
    // Asegurar formato HH:MM:SS
    if (horaDesde && horaDesde.length === 5) horaDesde += ':00';
    if (horaHasta && horaHasta.length === 5) horaHasta += ':00';
    
    const formData = {
        orden: parseInt(document.getElementById('turno_orden').value),
        hora_desde: horaDesde,
        hora_hasta: horaHasta
    };
    
    try {
        const turnoId = document.getElementById('turno_id_modal').value;
        let response;
        
        if (turnoId) {
            response = await auth.fetch(`/turnos/${turnoId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            response = await auth.fetch('/turnos', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }
        
        const data = await response.json();
        
        if (data.estado) {
            alert(turnoId ? 'Turno actualizado correctamente' : 'Turno creado correctamente');
            cerrarModalTurno();
            loadTurnos();
        } else {
            errorDiv.textContent = data.mensaje || 'Error al guardar el turno';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión o servidor';
        errorDiv.style.display = 'block';
    }
}

function filtrarTurnos() {
    const estado = document.getElementById('filterEstadoTurno').value;
    
    let filtrados = turnosTableData;
    
    if (estado !== '') {
        filtrados = filtrados.filter(t => t.activo === parseInt(estado));
    }
    
    renderTurnosTable(filtrados);
}

function limpiarFiltrosTurnos() {
    document.getElementById('filterEstadoTurno').value = '';
    renderTurnosTable(turnosTableData);
}

// ===== USUARIOS - BREAD =====
let usuariosTableData = [];

async function loadUsuarios() {
    const container = document.getElementById('usuariosTable');
    if (container) {
        container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando usuarios...</p></div>';
    }
    
    try {
        const response = await auth.fetch('/usuarios?limit=100');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.estado && data.datos) {
            usuariosTableData = Array.isArray(data.datos) ? data.datos : [];
            if (container) {
                renderUsuariosTable(usuariosTableData);
            }
        } else {
            if (container) {
                container.innerHTML = '<p class="empty-state">No hay usuarios disponibles</p>';
            }
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        if (container) {
            container.innerHTML = `<p class="error-message">Error al cargar usuarios: ${error.message}</p>`;
        }
    }
}

function renderUsuariosTable(usuarios) {
    const container = document.getElementById('usuariosTable');
    if (!container) return;
    
    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron usuarios</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Celular</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    usuarios.forEach(usuario => {
        const tipoUsuario = usuario.tipo_usuario === 1 ? 'Administrador' : 
                           usuario.tipo_usuario === 2 ? 'Empleado' : 'Cliente';
        const tipoBadge = usuario.tipo_usuario === 1 ? 'badge-danger' : 
                         usuario.tipo_usuario === 2 ? 'badge-warning' : 'badge-info';
        const estado = usuario.activo === 1 ? 
            '<span class="badge badge-success">Activo</span>' : 
            '<span class="badge badge-danger">Inactivo</span>';
        
        html += `
            <tr>
                <td>${usuario.usuario_id}</td>
                <td><strong>${usuario.nombre || 'N/A'}</strong></td>
                <td>${usuario.apellido || 'N/A'}</td>
                <td>${usuario.nombre_usuario || 'N/A'}</td>
                <td><span class="badge ${tipoBadge}">${tipoUsuario}</span></td>
                <td>${usuario.celular || 'N/A'}</td>
                <td>${estado}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-view" onclick="verUsuario(${usuario.usuario_id})" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editarUsuario(${usuario.usuario_id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="eliminarUsuario(${usuario.usuario_id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function verUsuario(id) {
    try {
        const response = await auth.fetch(`/usuarios/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const usuario = data.datos;
            const tipoUsuario = usuario.tipo_usuario === 1 ? 'Administrador' : 
                               usuario.tipo_usuario === 2 ? 'Empleado' : 'Cliente';
            alert(`Usuario: ${usuario.nombre} ${usuario.apellido}\nEmail: ${usuario.nombre_usuario}\nTipo: ${tipoUsuario}\nCelular: ${usuario.celular || 'N/A'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del usuario');
    }
}

async function editarUsuario(id) {
    try {
        const response = await auth.fetch(`/usuarios/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            abrirModalUsuario(data.datos);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el usuario para editar');
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await auth.fetch(`/usuarios/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.estado) {
            alert('Usuario eliminado correctamente');
            loadUsuarios();
        } else {
            alert(data.mensaje || 'Error al eliminar el usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario');
    }
}

function abrirModalUsuario(usuario = null) {
    const modal = document.getElementById('modalUsuario');
    const form = document.getElementById('formUsuario');
    
    if (usuario) {
        document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';
        document.getElementById('usuario_id_modal').value = usuario.usuario_id;
        document.getElementById('usuario_nombre').value = usuario.nombre || '';
        document.getElementById('usuario_apellido').value = usuario.apellido || '';
        document.getElementById('usuario_email').value = usuario.nombre_usuario || '';
        document.getElementById('usuario_tipo').value = usuario.tipo_usuario || '';
        document.getElementById('usuario_celular').value = usuario.celular || '';
        document.getElementById('usuario_contrasenia').value = '';
        document.getElementById('usuario_contrasenia').required = false;
        document.getElementById('passwordRequired').textContent = '';
        document.getElementById('passwordHelp').textContent = 'Dejar vacío para mantener la contraseña actual';
    } else {
        document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
        form.reset();
        document.getElementById('usuario_id_modal').value = '';
        document.getElementById('usuario_contrasenia').required = true;
        document.getElementById('passwordRequired').textContent = '*';
        document.getElementById('passwordHelp').textContent = 'Mínimo 6 caracteres';
    }
    
    document.getElementById('modalErrorUsuario').style.display = 'none';
    modal.classList.add('active');
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('active');
    document.getElementById('modalErrorUsuario').style.display = 'none';
}

async function guardarUsuario(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('modalErrorUsuario');
    errorDiv.style.display = 'none';
    
    const formData = {
        nombre: document.getElementById('usuario_nombre').value,
        apellido: document.getElementById('usuario_apellido').value,
        nombre_usuario: document.getElementById('usuario_email').value,
        tipo_usuario: parseInt(document.getElementById('usuario_tipo').value),
        celular: document.getElementById('usuario_celular').value || null
    };
    
    const contrasenia = document.getElementById('usuario_contrasenia').value;
    const usuarioId = document.getElementById('usuario_id_modal').value;
    
    // Solo incluir contraseña si se proporciona (o si es nuevo usuario)
    if (contrasenia || !usuarioId) {
        if (!contrasenia && !usuarioId) {
            errorDiv.textContent = 'La contraseña es requerida para nuevos usuarios';
            errorDiv.style.display = 'block';
            return;
        }
        if (contrasenia) {
            formData.contrasenia = contrasenia;
        }
    }
    
    try {
        let response;
        
        if (usuarioId) {
            response = await auth.fetch(`/usuarios/${usuarioId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            response = await auth.fetch('/usuarios', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }
        
        const data = await response.json();
        
        if (data.estado) {
            alert(usuarioId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            cerrarModalUsuario();
            loadUsuarios();
        } else {
            errorDiv.textContent = data.mensaje || 'Error al guardar el usuario';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión o servidor';
        errorDiv.style.display = 'block';
    }
}

function filtrarUsuarios() {
    const search = document.getElementById('searchUsuarios').value.toLowerCase();
    const tipo = document.getElementById('filterTipoUsuario').value;
    const estado = document.getElementById('filterEstadoUsuario').value;
    
    let filtrados = usuariosTableData;
    
    if (search) {
        filtrados = filtrados.filter(u => 
            (u.nombre && u.nombre.toLowerCase().includes(search)) ||
            (u.apellido && u.apellido.toLowerCase().includes(search)) ||
            (u.nombre_usuario && u.nombre_usuario.toLowerCase().includes(search)) ||
            (u.usuario_id && u.usuario_id.toString().includes(search))
        );
    }
    
    if (tipo !== '') {
        filtrados = filtrados.filter(u => u.tipo_usuario === parseInt(tipo));
    }
    
    if (estado !== '') {
        filtrados = filtrados.filter(u => u.activo === parseInt(estado));
    }
    
    renderUsuariosTable(filtrados);
}

function limpiarFiltrosUsuarios() {
    document.getElementById('searchUsuarios').value = '';
    document.getElementById('filterTipoUsuario').value = '';
    document.getElementById('filterEstadoUsuario').value = '';
    renderUsuariosTable(usuariosTableData);
}

// ===== INFORMES =====
async function generarInforme(formato) {
    try {
        const btn = formato === 'pdf' ? document.getElementById('btnGenerarPDF') : document.getElementById('btnGenerarCSV');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        
        const token = auth.getToken();
        const response = await fetch(`${window.location.origin}/api/v1/informes?formato=${formato}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ mensaje: 'Error al generar el informe' }));
            throw new Error(errorData.mensaje || `Error ${response.status}`);
        }
        
        // Obtener el nombre del archivo del header Content-Disposition o generar uno
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `informe_reservas.${formato}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        // Descargar el archivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`Informe ${formato.toUpperCase()} generado y descargado correctamente`);
        
    } catch (error) {
        console.error('Error generando informe:', error);
        alert(`Error al generar el informe: ${error.message}`);
    } finally {
        const btn = formato === 'pdf' ? document.getElementById('btnGenerarPDF') : document.getElementById('btnGenerarCSV');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = formato === 'pdf' ? 
                '<i class="fas fa-download"></i> Generar PDF' : 
                '<i class="fas fa-download"></i> Generar CSV';
        }
    }
}

// Hacer funciones globales para onclick
window.verReserva = verReserva;
window.editarReserva = editarReserva;
window.eliminarReserva = eliminarReserva;
window.verSalon = verSalon;
window.editarSalon = editarSalon;
window.eliminarSalon = eliminarSalon;
window.verServicio = verServicio;
window.editarServicio = editarServicio;
window.eliminarServicio = eliminarServicio;
window.verTurno = verTurno;
window.editarTurno = editarTurno;
window.eliminarTurno = eliminarTurno;
window.verUsuario = verUsuario;
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;

