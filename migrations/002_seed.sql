INSERT INTO Usuario (nombre, apellido, email, contrasena)
VALUES
('Ernesto', 'De Luna', 'ernesto@devcore.com', 'hash_password_1'),
('Admin', 'Sistema', 'admin@devcore.com', 'hash_password_2'),
('Maria', 'Lopez', 'maria@devcore.com', 'hash_password_3');

INSERT INTO Proyecto (nombre, descripcion, fecha_inicio, fecha_fin, estado, creado_por)
VALUES
('DevCore', 'Sistema de gestion de proyectos con enfoque Scrum', '2026-03-23', '2026-06-14', 'Activo', 1);

INSERT INTO Sprint (id_proyecto, nombre, fecha_inicio, fecha_fin, estado)
VALUES
(1, 'Sprint 1', '2026-03-23', '2026-05-10', 'Activo'),
(1, 'Sprint 2', '2026-05-11', '2026-06-14', 'Pendiente');

INSERT INTO Miembro_Proyecto (id_usuario, id_proyecto, rol)
VALUES
(1, 1, 'Administrador'),
(2, 1, 'Lider'),
(3, 1, 'Desarrollador');

INSERT INTO Tarea (id_proyecto, id_sprint, titulo, descripcion, prioridad, estado, fecha_inicio, fecha_fin, creado_por, asignado_a)
VALUES
(1, 1, 'Configurar backend', 'Inicializar Express y estructura base del servidor', 'Alta', 'En progreso', '2026-03-23', '2026-03-30', 1, 2),
(1, 1, 'Diseñar interfaz principal', 'Construccion inicial del dashboard en Next.js', 'Media', 'Pendiente', '2026-03-24', '2026-04-02', 1, 3);

INSERT INTO Comentario (comentario, id_usuario, id_tarea)
VALUES
('Se inicio la configuracion del servidor correctamente', 2, 1),
('La vista principal ya tiene wireframe inicial', 3, 2);