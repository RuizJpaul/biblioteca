-- ==========================================================
-- TABLA: usuario
-- ==========================================================
CREATE TABLE usuario (
    idUsuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    tipoUsuario VARCHAR(20) DEFAULT 'usuario' CHECK (tipoUsuario IN ('admin', 'usuario')),
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLA: libro
-- ==========================================================
CREATE TABLE libro (
    idLibro SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    anio INT,
    descripcion TEXT,
    editorial VARCHAR(150),
    autor VARCHAR(150),
    genero VARCHAR(100),
    img_url TEXT,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'intercambiado', 'prestado')),
    idUsuario INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_libro FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- ==========================================================
-- TABLA: intercambio
-- ==========================================================
CREATE TABLE intercambio (
    idIntercambio SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    libro_ofrecido_id INT NOT NULL,
    libro_recibido_id INT NOT NULL,
    usuario_origen_id INT NOT NULL,
    usuario_destino_id INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')),
    
    CONSTRAINT fk_libro_ofrecido FOREIGN KEY (libro_ofrecido_id) REFERENCES libro(idLibro) ON DELETE CASCADE,
    CONSTRAINT fk_libro_recibido FOREIGN KEY (libro_recibido_id) REFERENCES libro(idLibro) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_origen FOREIGN KEY (usuario_origen_id) REFERENCES usuario(idUsuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_destino FOREIGN KEY (usuario_destino_id) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- ==========================================================
-- ÍNDICES
-- ==========================================================
CREATE INDEX idx_libro_usuario ON libro(idUsuario);
CREATE INDEX idx_libro_genero ON libro(genero);
CREATE INDEX idx_libro_estado ON libro(estado);
CREATE INDEX idx_intercambio_fecha ON intercambio(fecha);
CREATE INDEX idx_intercambio_usuario_origen ON intercambio(usuario_origen_id);
CREATE INDEX idx_intercambio_usuario_destino ON intercambio(usuario_destino_id);
