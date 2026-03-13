CREATE TABLE Usuario (
    id_usuario BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Proyecto (
    id_proyecto BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    fecha_inicio DATETIME NULL,
    fecha_fin DATETIME NULL,
    estado VARCHAR(50) NOT NULL,
    creado_por BIGINT NOT NULL,
    CONSTRAINT FK_Proyecto_Creador
        FOREIGN KEY (creado_por) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Sprint (
    id_sprint BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_proyecto BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado VARCHAR(50) NOT NULL,
    CONSTRAINT FK_Sprint_Proyecto
        FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto)
);

CREATE TABLE Tarea (
    id_tarea BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_proyecto BIGINT NOT NULL,
    id_sprint BIGINT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    prioridad VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_inicio DATETIME NULL,
    fecha_fin DATETIME NULL,
    creado_por BIGINT NOT NULL,
    asignado_a BIGINT NOT NULL,
    CONSTRAINT FK_Tarea_Proyecto
        FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto),
    CONSTRAINT FK_Tarea_Sprint
        FOREIGN KEY (id_sprint) REFERENCES Sprint(id_sprint),
    CONSTRAINT FK_Tarea_Creador
        FOREIGN KEY (creado_por) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Tarea_Asignado
        FOREIGN KEY (asignado_a) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Comentario (
    id_comentario BIGINT IDENTITY(1,1) PRIMARY KEY,
    comentario VARCHAR(255) NOT NULL,
    id_usuario BIGINT NOT NULL,
    id_tarea BIGINT NOT NULL,
    CONSTRAINT FK_Comentario_Usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Comentario_Tarea
        FOREIGN KEY (id_tarea) REFERENCES Tarea(id_tarea)
);

CREATE TABLE Miembro_Proyecto (
    id_mp BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_proyecto BIGINT NOT NULL,
    rol VARCHAR(50) NOT NULL,
    CONSTRAINT FK_MiembroProyecto_Usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_MiembroProyecto_Proyecto
        FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto)
);