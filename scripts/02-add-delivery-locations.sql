-- ==========================================================
-- TABLA: punto_entrega
-- ==========================================================
CREATE TABLE punto_entrega (
    idPuntoEntrega SERIAL PRIMARY KEY,
    idUsuario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100),
    codigo_postal VARCHAR(20),
    referencia TEXT,
    es_predeterminado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_punto FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- ==========================================================
-- MODIFICAR TABLA: intercambio
-- ==========================================================
-- Agregar columnas para ubicaciones de entrega
ALTER TABLE intercambio ADD COLUMN punto_entrega_usuario_origen INT;
ALTER TABLE intercambio ADD COLUMN punto_entrega_usuario_destino INT;
ALTER TABLE intercambio ADD COLUMN notas_entrega TEXT;

-- Agregar foreign keys
ALTER TABLE intercambio 
ADD CONSTRAINT fk_punto_origen 
FOREIGN KEY (punto_entrega_usuario_origen) REFERENCES punto_entrega(idPuntoEntrega) ON DELETE SET NULL;

ALTER TABLE intercambio 
ADD CONSTRAINT fk_punto_destino 
FOREIGN KEY (punto_entrega_usuario_destino) REFERENCES punto_entrega(idPuntoEntrega) ON DELETE SET NULL;

-- ==========================================================
-- ÍNDICES
-- ==========================================================
CREATE INDEX idx_punto_entrega_usuario ON punto_entrega(idUsuario);
CREATE INDEX idx_intercambio_punto_origen ON intercambio(punto_entrega_usuario_origen);
CREATE INDEX idx_intercambio_punto_destino ON intercambio(punto_entrega_usuario_destino);
