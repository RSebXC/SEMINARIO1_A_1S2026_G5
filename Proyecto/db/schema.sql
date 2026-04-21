CREATE DATABASE IF NOT EXISTS semisocial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE semisocial;

-- ─── USUARIOS ────────────────────────────────────────────────────────────────
-- cognito_sub = UUID que devuelve Cognito al registrar, sirve de llave foránea
CREATE TABLE IF NOT EXISTS usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    cognito_sub     VARCHAR(100) NOT NULL UNIQUE,  -- UUID de Cognito
    nombre_completo VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(500) NOT NULL, 
    dpi             VARCHAR(20)  NOT NULL,
    foto_perfil_key VARCHAR(500),   -- ruta en S3
    foto_perfil_url VARCHAR(1000),  -- URL pública S3
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── PUBLICACIONES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publicaciones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_sub     VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    imagen_key      VARCHAR(500) NOT NULL,
    imagen_url      VARCHAR(1000) NOT NULL,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_sub) REFERENCES usuarios(cognito_sub) ON DELETE CASCADE
);

-- ─── ETIQUETAS (Rekognition) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etiquetas (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS publicacion_etiquetas (
    publicacion_id INT NOT NULL,
    etiqueta_id    INT NOT NULL,
    confianza      TINYINT UNSIGNED DEFAULT 0,
    PRIMARY KEY (publicacion_id, etiqueta_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id)    REFERENCES etiquetas(id)     ON DELETE CASCADE
);

-- ─── COMENTARIOS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comentarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id  INT NOT NULL,
    usuario_sub     VARCHAR(100) NOT NULL,
    contenido       TEXT NOT NULL,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_sub)    REFERENCES usuarios(cognito_sub) ON DELETE CASCADE
);

-- ─── SOLICITUDES Y AMISTADES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitudes_amistad (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    solicitante_sub VARCHAR(100) NOT NULL,
    receptor_sub    VARCHAR(100) NOT NULL,
    estado          ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_solicitud (solicitante_sub, receptor_sub),
    FOREIGN KEY (solicitante_sub) REFERENCES usuarios(cognito_sub) ON DELETE CASCADE,
    FOREIGN KEY (receptor_sub)    REFERENCES usuarios(cognito_sub) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS amistades (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_a_sub   VARCHAR(100) NOT NULL,
    usuario_b_sub   VARCHAR(100) NOT NULL,
    estado          ENUM('aceptada') DEFAULT 'aceptada',
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_amistad (usuario_a_sub, usuario_b_sub),
    FOREIGN KEY (usuario_a_sub) REFERENCES usuarios(cognito_sub) ON DELETE CASCADE,
    FOREIGN KEY (usuario_b_sub) REFERENCES usuarios(cognito_sub) ON DELETE CASCADE
);

-- ─── MENSAJES DE CHAT ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mensajes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    emisor_sub      VARCHAR(100) NOT NULL,
    receptor_sub    VARCHAR(100) NOT NULL,
    contenido       TEXT NOT NULL,
    leido           BOOLEAN DEFAULT FALSE,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emisor_sub)   REFERENCES usuarios(cognito_sub) ON DELETE CASCADE,
    FOREIGN KEY (receptor_sub) REFERENCES usuarios(cognito_sub) ON DELETE CASCADE
);

-- ─── ÍNDICES para mejorar rendimiento ────────────────────────────────────────
CREATE INDEX idx_pub_usuario   ON publicaciones(usuario_sub);
CREATE INDEX idx_pub_fecha     ON publicaciones(fecha_creacion DESC);
CREATE INDEX idx_com_pub       ON comentarios(publicacion_id);
CREATE INDEX idx_msg_emisor    ON mensajes(emisor_sub, receptor_sub);
CREATE INDEX idx_msg_fecha     ON mensajes(fecha_creacion);
