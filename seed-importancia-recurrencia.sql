-- Script para insertar valores iniciales en las tablas de importancia y recurrencia
-- Este archivo NO debe ser trackeado por Git

-- Insertar valores de importancia
INSERT INTO importancia (id, nombre) VALUES
(1, 'Muy Baja'),
(2, 'Baja'),
(3, 'Media'),
(4, 'Alta'),
(5, 'Muy Alta')
ON CONFLICT (id) DO NOTHING;

-- Insertar valores de recurrencia
INSERT INTO recurrencia (id, nombre) VALUES
(1, 'Sin Recurrencia'),
(2, 'Diario'),
(3, 'Semanal'),
(4, 'Mensual'),
(5, 'Anual'),
(6, 'Lunes'),
(7, 'Martes'),
(8, 'Miércoles'),
(9, 'Jueves'),
(10, 'Viernes'),
(11, 'Sábado'),
(12, 'Domingo')
ON CONFLICT (id) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 'Importancia' as tabla, id, nombre FROM importancia ORDER BY id;
SELECT 'Recurrencia' as tabla, id, nombre FROM recurrencia ORDER BY id;
