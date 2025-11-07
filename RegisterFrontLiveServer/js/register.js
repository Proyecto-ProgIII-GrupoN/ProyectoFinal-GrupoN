// Ajustá la URL base del backend si corrés con Live Server (origen distinto)
const API_BASE_URL = (window.API_BASE_URL_OVERRIDE) || 'http://localhost:3000/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  const fotoInput = document.getElementById('foto');
  const fotoPreview = document.getElementById('fotoPreview');
  const fotoImg = document.getElementById('fotoImg');
  const apiOrigin = (() => { try { return new URL(API_BASE_URL).origin; } catch { return 'http://localhost:3000'; } })();

  fotoInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      fotoPreview.style.display = 'none';
      fotoImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      fotoImg.src = reader.result;
      fotoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🚀 Formulario enviado');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    successDiv.style.display = 'none';
    successDiv.textContent = '';

    try {
      const formData = new FormData(form);
      console.log('📤 Enviando datos al servidor...');
      
      const resp = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData
      });

      console.log('📥 Respuesta recibida, status:', resp.status);
      const text = await resp.text();
      console.log('📥 Texto de respuesta:', text);
      
      let data;
      try { 
        data = JSON.parse(text); 
        console.log('✅ JSON parseado correctamente:', data);
      } catch (parseError) { 
        console.error('❌ Error al parsear JSON:', parseError);
        data = { estado: false, mensaje: text || 'Respuesta no válida del servidor' }; 
      }

      console.log('🔍 Verificando respuesta...');
      console.log('  - resp.ok:', resp.ok);
      console.log('  - data.estado:', data?.estado);
      console.log('  - data:', data);

      if (!resp.ok || !data.estado) {
        const msg = (data && (data.mensaje || (data.errores && data.errores.map(e => e.msg).join(', ')))) || `Error ${resp.status}`;
        console.error('❌ Error detectado:', msg);
        throw new Error(msg);
      }

      console.log('✅ Registro exitoso! Preparando mensaje...');
      
      // Obtener nombre del usuario registrado
      const nombreCompleto = (data && data.usuario) ? `${data.usuario.nombre || ''} ${data.usuario.apellido || ''}`.trim() : 'usuario';
      console.log('👤 Nombre completo:', nombreCompleto);
      
      // Mostrar mensaje de éxito en la página
      const mensaje = `¡Registro exitoso! ¡Bienvenido ${nombreCompleto}! Tu cuenta ha sido creada perfectamente. Ya podés iniciar sesión.`;
      console.log('🎉 Mostrando mensaje:', mensaje);
      
      // Mostrar mensaje visual en la página
      successDiv.textContent = `✅ ${mensaje}`;
      successDiv.style.display = 'block';
      
      // Scroll al mensaje para que sea visible
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Construir URL de redirección a success.html con params
      const fotoRel = data?.usuario?.foto || '';
      const fotoAbs = fotoRel ? (fotoRel.startsWith('http') ? fotoRel : `${apiOrigin}${fotoRel}`) : '';
      const params = new URLSearchParams({ name: nombreCompleto, ...(fotoAbs && { foto: fotoAbs }) });
      const redirectUrl = `success.html?${params.toString()}`;

      // Redirigir automáticamente
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
      
    } catch (err) {
      console.error('❌ Error en registro:', err);
      console.error('❌ Stack:', err.stack);
      errorDiv.textContent = err.message || 'Error de conexión o servidor';
      errorDiv.style.display = 'block';
    }
  });
});
