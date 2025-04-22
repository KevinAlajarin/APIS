USE apis_app;
GO

-- Tabla de roles
CREATE TABLE roles (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(100) NULL
);
GO

INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('cliente', 'Usuario que contrata servicios'),
('entrenador', 'Profesional que ofrece servicios');
GO

-- Tabla de usuarios 
CREATE TABLE usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    id_rol INT NOT NULL FOREIGN KEY REFERENCES roles(id_rol),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_normalizado AS (LOWER(TRIM(email))) PERSISTED,
    contraseña_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL;
    reset_token_expira DATETIME2(0) NULL;
    fecha_nacimiento DATE NOT NULL,
    fecha_registro DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_eliminacion DATETIME2(0) NULL,
    eliminado BIT DEFAULT 0
);
GO

-- Índices para usuarios
CREATE UNIQUE INDEX idx_usuarios_email_normalizado 
ON usuarios(email_normalizado) 
WHERE eliminado = 0;

CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
GO

-- Tabla de zonas (mantenemos eliminado para zonas)
CREATE TABLE zonas (
    id_zona INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    fecha_creacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_eliminacion DATETIME2(0) NULL,
    eliminado BIT DEFAULT 0
);
GO

INSERT INTO zonas (nombre) VALUES 
('Palermo'),('Recoleta'),('Belgrano'),('Caballito'),('San Telmo'),
('La Boca'),('Puerto Madero'),('Flores'),('Villa Crespo'),('Nuñez');
GO

-- Tabla de categorías (mantenemos eliminado para categorías)
CREATE TABLE categorias (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    fecha_creacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_eliminacion DATETIME2(0) NULL,
    eliminado BIT DEFAULT 0
);
GO

INSERT INTO categorias (nombre) VALUES 
('Yoga'),('Pilates'),('Nutricion'),('Gimnasio'),('Running');
GO

-- Tabla de servicios (MODIFICADA para hard delete)
CREATE TABLE servicios (
    id_servicio INT IDENTITY(1,1) PRIMARY KEY,
    id_entrenador INT NOT NULL FOREIGN KEY REFERENCES usuarios(id_usuario),
    id_categoria INT NOT NULL FOREIGN KEY REFERENCES categorias(id_categoria),
    id_zona INT NOT NULL FOREIGN KEY REFERENCES zonas(id_zona),
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio > 0),
    duracion INT NOT NULL CHECK (duracion IN (15, 30, 60)),
    fecha_hora_inicio DATETIME2(0) NOT NULL,
    fecha_hora_fin DATETIME2(0) NOT NULL,
    idioma VARCHAR(20) NOT NULL CHECK (idioma IN ('Español', 'Inglés')),
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('virtual', 'presencial')),
    activo BIT DEFAULT 1,
    visualizaciones INT DEFAULT 0,
    id_evento_calendar VARCHAR(255) NULL,
    fecha_creacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME()
    -- Eliminados los campos: fecha_eliminacion y eliminado
    -- Eliminada la constraint: chk_servicio_activo_no_eliminado
);
GO

-- Índices para servicios (MODIFICADOS)
CREATE NONCLUSTERED INDEX idx_servicios_busqueda 
ON servicios (id_categoria, id_zona, precio)
INCLUDE (modalidad, idioma, duracion, fecha_hora_inicio, fecha_hora_fin)
WHERE activo = 1;  -- Solo filtramos por activo ahora

CREATE UNIQUE INDEX idx_servicios_entrenador_horario 
ON servicios(id_entrenador, fecha_hora_inicio, fecha_hora_fin)
WHERE activo = 1;  -- Solo filtramos por activo ahora

CREATE INDEX idx_servicios_entrenador ON servicios(id_entrenador);
GO

-- Tabla de contrataciones (MODIFICADA para hard delete)
CREATE TABLE contrataciones (
    id_contratacion INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL FOREIGN KEY REFERENCES usuarios(id_usuario),
    id_servicio INT NOT NULL FOREIGN KEY REFERENCES servicios(id_servicio),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'aceptado', 'completado', 'cancelado')),
    fecha_solicitud DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_aceptacion DATETIME2(0) NULL,
    fecha_completado DATETIME2(0) NULL,
    fecha_cancelado DATETIME2(0) NULL,
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME()
    -- Eliminados los campos: fecha_eliminacion y eliminado
);
GO

-- Índices para contrataciones
CREATE INDEX idx_contrataciones_cliente ON contrataciones(id_cliente);
CREATE INDEX idx_contrataciones_servicio ON contrataciones(id_servicio);
CREATE INDEX idx_contrataciones_estado ON contrataciones(estado);
GO

-- Trigger para actualizar fechas de contratación (MODIFICADO)
CREATE TRIGGER tr_actualizar_fechas_contratacion
ON contrataciones
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(estado)
    BEGIN
        UPDATE c
        SET fecha_aceptacion = CASE 
                                WHEN i.estado = 'aceptado' AND d.estado <> 'aceptado' THEN SYSDATETIME()
                                ELSE c.fecha_aceptacion
                              END,
            fecha_completado = CASE 
                                WHEN i.estado = 'completado' AND d.estado <> 'completado' THEN SYSDATETIME()
                                ELSE c.fecha_completado
                              END,
            fecha_cancelado = CASE 
                                WHEN i.estado = 'cancelado' AND d.estado <> 'cancelado' THEN SYSDATETIME()
                                ELSE c.fecha_cancelado
                              END,
            fecha_ultima_actualizacion = SYSDATETIME()
        FROM contrataciones c
        INNER JOIN inserted i ON c.id_contratacion = i.id_contratacion
        INNER JOIN deleted d ON c.id_contratacion = d.id_contratacion;
    END
END;
GO

-- Trigger para prevenir autocontratación
CREATE TRIGGER trg_prevenir_autocontratacion
ON contrataciones
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN servicios s ON i.id_servicio = s.id_servicio
        WHERE i.id_cliente = s.id_entrenador
    )
    BEGIN
        RAISERROR('Un entrenador no puede contratarse a sí mismo', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- Tabla de reseñas (MODIFICADA para hard delete)
CREATE TABLE resenias (
    id_resenia INT IDENTITY(1,1) PRIMARY KEY,
    id_contratacion INT UNIQUE NOT NULL FOREIGN KEY REFERENCES contrataciones(id_contratacion),
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('aprobado', 'pendiente', 'rechazado')),
    fecha_creacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_aprobacion DATETIME2(0) NULL
    -- Eliminados los campos: fecha_eliminacion y eliminado
);
GO

-- Índice para mejorar el OUTER APPLY en la vista
CREATE NONCLUSTERED INDEX idx_resenias_id_contratacion
ON resenias (id_contratacion);

-- Tabla de respuestas a reseñas (MODIFICADA para hard delete)
CREATE TABLE respuestas_resenias (
    id_respuesta INT IDENTITY(1,1) PRIMARY KEY,
    id_resenia INT NOT NULL FOREIGN KEY REFERENCES resenias(id_resenia),
    id_entrenador INT NOT NULL FOREIGN KEY REFERENCES usuarios(id_usuario),
    texto TEXT NOT NULL,
    fecha_creacion DATETIME2(0) DEFAULT SYSDATETIME(),
    fecha_ultima_actualizacion DATETIME2(0) DEFAULT SYSDATETIME()
    -- Eliminado el campo: eliminado
);
GO

-- Tabla de visualizaciones
CREATE TABLE visualizaciones_servicios (
    id_visualizacion INT IDENTITY(1,1) PRIMARY KEY,
    id_servicio INT NOT NULL FOREIGN KEY REFERENCES servicios(id_servicio),
    id_usuario INT FOREIGN KEY REFERENCES usuarios(id_usuario),
    fecha DATETIME2(0) DEFAULT SYSDATETIME()
);
GO

-- Índice recomendado si usás una tabla de tracking de visualizaciones por servicio
CREATE NONCLUSTERED INDEX idx_visualizaciones_servicios_id_servicio
ON visualizaciones_servicios (id_servicio);
GO

-- Tabla de mensajes
CREATE TABLE mensajes (
    id_mensaje INT IDENTITY(1,1) PRIMARY KEY,
    id_contratacion INT NOT NULL FOREIGN KEY REFERENCES contrataciones(id_contratacion),
    id_remitente INT NOT NULL FOREIGN KEY REFERENCES usuarios(id_usuario),
    texto TEXT NOT NULL,
    fecha_hora DATETIME2(0) DEFAULT SYSDATETIME()
);
GO

-- Tabla de pagos
CREATE TABLE pagos (
    id_pago INT IDENTITY(1,1) PRIMARY KEY,
    id_contratacion INT NOT NULL FOREIGN KEY REFERENCES contrataciones(id_contratacion),
    monto DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('exitoso', 'fallido')),
    fecha DATETIME2(0) DEFAULT SYSDATETIME()
);
GO

-- Procedimiento para registro de usuarios (MODIFICADO)
CREATE PROCEDURE sp_registrar_usuario
    @id_rol INT,
    @nombre VARCHAR(100),
    @apellido VARCHAR(100),
    @email VARCHAR(255),
    @contraseña_hash VARCHAR(255),
    @fecha_nacimiento DATE,
    @id_usuario INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF EXISTS (
            SELECT 1 
            FROM usuarios 
            WHERE email_normalizado = LOWER(TRIM(@email)) AND eliminado = 0
        )
        BEGIN
            RAISERROR('El email ya está registrado', 16, 1);
            ROLLBACK;
            RETURN;
        END
        
        INSERT INTO usuarios (
            id_rol, nombre, apellido, email, 
            contraseña_hash, fecha_nacimiento
        )
        VALUES (
            @id_rol, @nombre, @apellido, @email,
            @contraseña_hash, @fecha_nacimiento
        );
        
        SET @id_usuario = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Vista optimizada de servicios (MODIFICADA)
CREATE VIEW vw_servicios_activos_enriquecidos AS
SELECT 
    s.id_servicio,
    s.id_entrenador,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre_entrenador,
    s.id_categoria,
    c.nombre AS categoria,
    s.id_zona,
    z.nombre AS zona,
    s.descripcion,
    s.precio,
    s.duracion,
    s.fecha_hora_inicio,
    s.fecha_hora_fin,
    s.idioma,
    s.modalidad,
    s.visualizaciones,
    ISNULL(e.calificacion_promedio, 0) AS calificacion_promedio,
    ISNULL(e.total_resenias, 0) AS total_resenias
FROM servicios s
JOIN usuarios u ON s.id_entrenador = u.id_usuario AND u.eliminado = 0
JOIN categorias c ON s.id_categoria = c.id_categoria AND c.eliminado = 0
JOIN zonas z ON s.id_zona = z.id_zona AND z.eliminado = 0
OUTER APPLY (
    SELECT 
        AVG(CAST(r.puntuacion AS DECIMAL(3,1))) AS calificacion_promedio,
        COUNT(*) AS total_resenias
    FROM resenias r
    JOIN contrataciones ct ON r.id_contratacion = ct.id_contratacion
    WHERE ct.id_servicio = s.id_servicio
    AND r.estado = 'aprobado'
) e
WHERE s.activo = 1;
GO