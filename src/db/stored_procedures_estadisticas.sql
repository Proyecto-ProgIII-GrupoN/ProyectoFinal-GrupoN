-- =============================================
-- STORED PROCEDURES PARA ESTADÍSTICAS
-- =============================================
-- Estos procedimientos almacenados son requeridos por el TP
-- para generar estadísticas de reservas

DELIMITER $$

-- =============================================
-- 1. Estadísticas Generales
-- =============================================
-- Retorna: Total de reservas activas, Total de ingresos, 
-- Promedio de reservas por mes, Total de clientes activos
DROP PROCEDURE IF EXISTS sp_estadisticas_generales$$
CREATE PROCEDURE sp_estadisticas_generales()
BEGIN
    SELECT 
        COUNT(DISTINCT r.reserva_id) AS total_reservas,
        COALESCE(SUM(r.importe_total), 0) AS total_ingresos,
        ROUND(COUNT(DISTINCT r.reserva_id) / GREATEST(TIMESTAMPDIFF(MONTH, MIN(r.fecha_reserva), CURDATE()), 1), 2) AS promedio_reservas_mes,
        COUNT(DISTINCT u.usuario_id) AS total_clientes_activos,
        COUNT(DISTINCT s.salon_id) AS total_salones_activos
    FROM reservas r
    INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
    INNER JOIN salones s ON r.salon_id = s.salon_id
    WHERE r.activo = 1 
    AND u.activo = 1 
    AND s.activo = 1;
END$$

-- =============================================
-- 2. Estadísticas por Salón
-- =============================================
-- Retorna: Reservas e ingresos agrupados por salón
DROP PROCEDURE IF EXISTS sp_estadisticas_por_salon$$
CREATE PROCEDURE sp_estadisticas_por_salon()
BEGIN
    SELECT 
        s.salon_id,
        s.titulo AS salon_titulo,
        COUNT(r.reserva_id) AS cantidad_reservas,
        COALESCE(SUM(r.importe_total), 0) AS total_ingresos,
        COALESCE(AVG(r.importe_total), 0) AS promedio_por_reserva
    FROM salones s
    LEFT JOIN reservas r ON s.salon_id = r.salon_id AND r.activo = 1
    WHERE s.activo = 1
    GROUP BY s.salon_id, s.titulo
    ORDER BY cantidad_reservas DESC, total_ingresos DESC;
END$$

-- =============================================
-- 3. Estadísticas por Período (Mes/Año)
-- =============================================
-- Retorna: Reservas e ingresos agrupados por mes y año
DROP PROCEDURE IF EXISTS sp_estadisticas_por_periodo$$
CREATE PROCEDURE sp_estadisticas_por_periodo()
BEGIN
    SELECT 
        YEAR(r.fecha_reserva) AS anio,
        MONTH(r.fecha_reserva) AS mes,
        DATE_FORMAT(r.fecha_reserva, '%Y-%m') AS periodo,
        DATE_FORMAT(r.fecha_reserva, '%M %Y') AS periodo_formateado,
        COUNT(r.reserva_id) AS cantidad_reservas,
        COALESCE(SUM(r.importe_total), 0) AS total_ingresos,
        COALESCE(AVG(r.importe_total), 0) AS promedio_por_reserva
    FROM reservas r
    WHERE r.activo = 1
    GROUP BY YEAR(r.fecha_reserva), MONTH(r.fecha_reserva), periodo, periodo_formateado
    ORDER BY anio DESC, mes DESC;
END$$

-- =============================================
-- 4. Estadísticas de Servicios
-- =============================================
-- Retorna: Servicios más contratados con sus ingresos
DROP PROCEDURE IF EXISTS sp_estadisticas_servicios$$
CREATE PROCEDURE sp_estadisticas_servicios()
BEGIN
    SELECT 
        s.servicio_id,
        s.descripcion AS servicio_descripcion,
        COUNT(rs.reserva_servicio_id) AS veces_contratado,
        COALESCE(SUM(rs.importe), 0) AS total_ingresos_servicio,
        COALESCE(AVG(rs.importe), 0) AS promedio_importe
    FROM servicios s
    LEFT JOIN reservas_servicios rs ON s.servicio_id = rs.servicio_id
    LEFT JOIN reservas r ON rs.reserva_id = r.reserva_id AND r.activo = 1
    WHERE s.activo = 1
    GROUP BY s.servicio_id, s.descripcion
    HAVING veces_contratado > 0
    ORDER BY veces_contratado DESC, total_ingresos_servicio DESC;
END$$

-- =============================================
-- 5. Estadísticas de Clientes
-- =============================================
-- Retorna: Clientes más frecuentes con sus reservas e ingresos
DROP PROCEDURE IF EXISTS sp_estadisticas_clientes$$
CREATE PROCEDURE sp_estadisticas_clientes()
BEGIN
    SELECT 
        u.usuario_id,
        CONCAT(u.nombre, ' ', u.apellido) AS cliente_nombre,
        u.nombre_usuario AS cliente_email,
        COUNT(r.reserva_id) AS cantidad_reservas,
        COALESCE(SUM(r.importe_total), 0) AS total_gastado,
        COALESCE(AVG(r.importe_total), 0) AS promedio_por_reserva
    FROM usuarios u
    INNER JOIN reservas r ON u.usuario_id = r.usuario_id
    WHERE u.activo = 1 
    AND u.tipo_usuario = 3 
    AND r.activo = 1
    GROUP BY u.usuario_id, u.nombre, u.apellido, u.nombre_usuario
    ORDER BY cantidad_reservas DESC, total_gastado DESC
    LIMIT 20;
END$$


DELIMITER ;

