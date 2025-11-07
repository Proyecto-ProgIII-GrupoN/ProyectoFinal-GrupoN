// AuthService ya está disponible globalmente desde auth.js

// Variables globales
let reservasData = [];
let clientesData = [];
let salonesData = [];
let serviciosData = [];
let turnosData = [];

// Flags para evitar múltiples cargas simultáneas
let isLoadingReservas = false;
let isLoadingClientes = false;
let isLoadingSalones = false;
let isLoadingServicios = false;
let isLoadingTurnos = false;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!auth || !auth.getToken() || !auth.getUser() || auth.getUser().tipo_usuario !== 2) {
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

    // Cargar datos iniciales - Solo Reservas que es la sección activa por defecto
    // Los demás se cargarán bajo demanda cuando el usuario navegue
    loadReservas();

    // Event listeners - Reservas
    document.getElementById('searchReservas')?.addEventListener('input', filtrarReservas);
    document.getElementById('filterEstado')?.addEventListener('change', filtrarReservas);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);

    // Event listeners - Clientes
    document.getElementById('searchClientes')?.addEventListener('input', filtrarClientes);
    document.getElementById('btnLimpiarFiltrosClientes')?.addEventListener('click', limpiarFiltrosClientes);

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
            
            const sectionName = item.getAttribute('data-section');
            
            // Actualizar clases activas
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección
            showSection(sectionName);
            
            // Actualizar hash sin disparar hashchange
            const currentHash = window.location.hash.substring(1);
            if (currentHash !== sectionName) {
                window.history.replaceState(null, '', `#${sectionName}`);
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
            'clientes': 'Clientes',
            'salones': 'Salones',
            'servicios': 'Servicios',
            'turnos': 'Turnos'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }
        
        // Cargar datos cuando se muestra cada sección
        if (sectionName === 'reservas') {
            if (reservasData.length === 0 && !isLoadingReservas) {
                loadReservas();
            } else if (reservasData.length > 0) {
                renderReservasTable(reservasData);
            }
        } else if (sectionName === 'clientes') {
            if (clientesData.length === 0 && !isLoadingClientes) {
                loadClientes();
            } else if (clientesData.length > 0) {
                renderClientesTable(clientesData);
            }
        } else if (sectionName === 'salones') {
            if (salonesTableData.length === 0 && !isLoadingSalones) {
                loadSalones();
            } else if (salonesTableData.length > 0) {
                renderSalonesTable(salonesData);
            }
        } else if (sectionName === 'servicios') {
            if (serviciosTableData.length === 0 && !isLoadingServicios) {
                loadServicios();
            } else if (serviciosTableData.length > 0) {
                renderServiciosTable(serviciosData);
            }
        } else if (sectionName === 'turnos') {
            if (turnosTableData.length === 0 && !isLoadingTurnos) {
                loadTurnos();
            } else if (turnosTableData.length > 0) {
                renderTurnosTable(turnosData);
            }
        }
    }
}

// ===== RESERVAS - Solo lectura =====
async function loadReservas() {
    const container = document.getElementById('reservasTable');
    if (!container) return;
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingReservas) return;
    
    // Si ya hay datos cargados, solo renderizar (sin recargar)
    if (reservasData.length > 0) {
        renderReservasTable(reservasData);
        return;
    }
    
    isLoadingReservas = true;
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando reservas...</p></div>';
    
    try {
        const response = await auth.fetch('/reservas?limit=50&page=1&sortBy=fecha_reserva&sortOrder=DESC');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.estado && data.datos) {
            reservasData = Array.isArray(data.datos) ? data.datos : [];
            renderReservasTable(reservasData);
        } else {
            container.innerHTML = '<p class="empty-state">No hay reservas disponibles</p>';
        }
    } catch (error) {
        console.error('Error cargando reservas:', error);
        container.innerHTML = `<p class="error-message">Error al cargar reservas: ${error.message}</p>`;
    } finally {
        isLoadingReservas = false;
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
        let fecha = 'N/A';
        if (reserva.fecha_reserva) {
            try {
                const fechaObj = new Date(reserva.fecha_reserva);
                fecha = fechaObj.toLocaleDateString('es-AR');
            } catch (e) {
                fecha = reserva.fecha_reserva;
            }
        }
        
        const clienteNombre = reserva.usuario_nombre || reserva.cliente_nombre || 'N/A';
        const salonTitulo = reserva.salon_titulo || 'N/A';
        
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
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function verReserva(id) {
    try {
        const response = await auth.fetch(`/reservas/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const reserva = data.datos;
            let fecha = 'N/A';
            if (reserva.fecha_reserva) {
                try {
                    const fechaObj = new Date(reserva.fecha_reserva);
                    fecha = fechaObj.toLocaleDateString('es-AR');
                } catch (e) {
                    fecha = reserva.fecha_reserva;
                }
            }
            
            let info = `Reserva #${reserva.reserva_id}\n`;
            info += `Fecha: ${fecha}\n`;
            info += `Cliente: ${reserva.usuario_nombre || 'N/A'}\n`;
            info += `Salón: ${reserva.salon_titulo || 'N/A'}\n`;
            info += `Turno: ${reserva.hora_desde ? reserva.hora_desde.substring(0, 5) : 'N/A'} - ${reserva.hora_hasta ? reserva.hora_hasta.substring(0, 5) : 'N/A'}\n`;
            info += `Temática: ${reserva.tematica || 'N/A'}\n`;
            info += `Total: ${formatCurrency(reserva.importe_total || 0)}`;
            
            if (reserva.servicios && reserva.servicios.length > 0) {
                info += '\n\nServicios:\n';
                reserva.servicios.forEach(s => {
                    info += `- ${s.descripcion}: ${formatCurrency(s.importe)}\n`;
                });
            }
            
            alert(info);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles de la reserva');
    }
}

function filtrarReservas() {
    const search = document.getElementById('searchReservas').value.toLowerCase();
    const estado = document.getElementById('filterEstado').value;
    
    let filtrados = reservasData;
    
    if (search) {
        filtrados = filtrados.filter(r => 
            (r.usuario_nombre && r.usuario_nombre.toLowerCase().includes(search)) ||
            (r.cliente_nombre && r.cliente_nombre.toLowerCase().includes(search)) ||
            (r.salon_titulo && r.salon_titulo.toLowerCase().includes(search)) ||
            (r.reserva_id && r.reserva_id.toString().includes(search))
        );
    }
    
    if (estado !== '') {
        filtrados = filtrados.filter(r => r.activo === parseInt(estado));
    }
    
    renderReservasTable(filtrados);
}

function limpiarFiltros() {
    document.getElementById('searchReservas').value = '';
    document.getElementById('filterEstado').value = '';
    renderReservasTable(reservasData);
}

// ===== CLIENTES - Solo lectura =====
async function loadClientes() {
    const container = document.getElementById('clientesTable');
    if (!container) return;
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingClientes) return;
    
    // Si ya hay datos cargados, solo renderizar
    if (clientesData.length > 0) {
        renderClientesTable(clientesData);
        return;
    }
    
    isLoadingClientes = true;
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando clientes...</p></div>';
    
    try {
        const response = await auth.fetch('/usuarios/clientes?limit=50&page=1');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.estado && data.datos) {
            clientesData = Array.isArray(data.datos) ? data.datos : [];
            if (container) {
                renderClientesTable(clientesData);
            }
        } else {
            if (container) {
                container.innerHTML = '<p class="empty-state">No hay clientes disponibles</p>';
            }
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        if (container) {
            container.innerHTML = `<p class="error-message">Error al cargar clientes: ${error.message}</p>`;
        }
    } finally {
        isLoadingClientes = false;
    }
}

function renderClientesTable(clientes) {
    const container = document.getElementById('clientesTable');
    if (!container) return;
    
    if (!clientes || clientes.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron clientes</p>';
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
                    <th>Celular</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    clientes.forEach(cliente => {
        const estado = cliente.activo === 1 ? 
            '<span class="badge badge-success">Activo</span>' : 
            '<span class="badge badge-danger">Inactivo</span>';
        
        html += `
            <tr>
                <td>${cliente.usuario_id}</td>
                <td><strong>${cliente.nombre || 'N/A'}</strong></td>
                <td>${cliente.apellido || 'N/A'}</td>
                <td>${cliente.nombre_usuario || 'N/A'}</td>
                <td>${cliente.celular || 'N/A'}</td>
                <td>${estado}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-view" onclick="verCliente(${cliente.usuario_id})" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function verCliente(id) {
    try {
        const response = await auth.fetch(`/usuarios/${id}`);
        const data = await response.json();
        
        if (data.estado && data.datos) {
            const cliente = data.datos;
            alert(`Cliente: ${cliente.nombre} ${cliente.apellido}\nEmail: ${cliente.nombre_usuario}\nCelular: ${cliente.celular || 'N/A'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del cliente');
    }
}

function filtrarClientes() {
    const search = document.getElementById('searchClientes').value.toLowerCase();
    
    let filtrados = clientesData;
    
    if (search) {
        filtrados = filtrados.filter(c => 
            (c.nombre && c.nombre.toLowerCase().includes(search)) ||
            (c.apellido && c.apellido.toLowerCase().includes(search)) ||
            (c.nombre_usuario && c.nombre_usuario.toLowerCase().includes(search)) ||
            (c.usuario_id && c.usuario_id.toString().includes(search))
        );
    }
    
    renderClientesTable(filtrados);
}

function limpiarFiltrosClientes() {
    document.getElementById('searchClientes').value = '';
    renderClientesTable(clientesData);
}

// ===== SALONES - BREAD (copiado del admin) =====
let salonesTableData = [];

async function loadSalones() {
    const table = document.getElementById('salonesTable');
    if (!table) return;
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingSalones) return;
    
    // Si ya hay datos cargados, solo renderizar
    if (salonesTableData.length > 0) {
        renderSalonesTable(salonesData);
        return;
    }
    
    isLoadingSalones = true;
    table.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando salones...</p></div>';
    
    try {
        const response = await auth.fetch('/salones?limit=50&page=1');
        const data = await response.json();
        if (data.estado && data.datos) {
            salonesData = data.datos;
            renderSalonesTable(salonesData);
        } else {
            table.innerHTML = '<p class="empty-state">No hay salones disponibles</p>';
        }
    } catch (error) {
        console.error('Error cargando salones:', error);
        table.innerHTML = `<p class="error-message">Error al cargar salones: ${error.message}</p>`;
    } finally {
        isLoadingSalones = false;
    }
}

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

// ===== SERVICIOS - BREAD (copiado del admin) =====
let serviciosTableData = [];

async function loadServicios() {
    const table = document.getElementById('serviciosTable');
    if (!table) return;
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingServicios) return;
    
    // Si ya hay datos cargados, solo renderizar
    if (serviciosTableData.length > 0) {
        renderServiciosTable(serviciosData);
        return;
    }
    
    isLoadingServicios = true;
    table.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando servicios...</p></div>';
    
    try {
        const response = await auth.fetch('/servicios?limit=50&page=1');
        const data = await response.json();
        if (data.estado && data.datos) {
            serviciosData = data.datos;
            renderServiciosTable(serviciosData);
        } else {
            table.innerHTML = '<p class="empty-state">No hay servicios disponibles</p>';
        }
    } catch (error) {
        console.error('Error cargando servicios:', error);
        table.innerHTML = `<p class="error-message">Error al cargar servicios: ${error.message}</p>`;
    } finally {
        isLoadingServicios = false;
    }
}

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

// ===== TURNOS - BREAD (copiado del admin) =====
let turnosTableData = [];

async function loadTurnos() {
    const table = document.getElementById('turnosTable');
    if (!table) return;
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingTurnos) return;
    
    // Si ya hay datos cargados, solo renderizar
    if (turnosTableData.length > 0) {
        renderTurnosTable(turnosData);
        return;
    }
    
    isLoadingTurnos = true;
    table.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Cargando turnos...</p></div>';
    
    try {
        const response = await auth.fetch('/turnos?limit=50&page=1');
        const data = await response.json();
        if (data.estado && data.datos) {
            turnosData = data.datos;
            renderTurnosTable(turnosData);
        } else {
            table.innerHTML = '<p class="empty-state">No hay turnos disponibles</p>';
        }
    } catch (error) {
        console.error('Error cargando turnos:', error);
        table.innerHTML = `<p class="error-message">Error al cargar turnos: ${error.message}</p>`;
    } finally {
        isLoadingTurnos = false;
    }
}

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

// ===== UTILIDADES =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(amount);
}

// Hacer funciones globales para onclick
window.verReserva = verReserva;
window.verCliente = verCliente;
window.verSalon = verSalon;
window.editarSalon = editarSalon;
window.eliminarSalon = eliminarSalon;
window.verServicio = verServicio;
window.editarServicio = editarServicio;
window.eliminarServicio = eliminarServicio;
window.verTurno = verTurno;
window.editarTurno = editarTurno;
window.eliminarTurno = eliminarTurno;

