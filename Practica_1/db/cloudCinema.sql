CREATE DATABASE IF NOT EXISTS cloudCinema
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE cloudCinema;

DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS peliculas;
DROP TABLE IF EXISTS lista_reproduccion;


-- Tabla: usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    password_hash VARCHAR(32) NOT NULL,  -- MD5
    foto_perfil VARCHAR(500),  -- URL de S3
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: peliculas
CREATE TABLE peliculas (
    id_pelicula INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    director VARCHAR(255),
    anio_estreno INT,
    url_contenido VARCHAR(500),  -- YouTube
    poster VARCHAR(500),  -- URL de S3
    estado ENUM('Disponible', 'Próximo estreno') DEFAULT 'Disponible'
);

-- Tabla: lista_reproduccion
CREATE TABLE lista_reproduccion (
    id_lista INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_pelicula INT,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_pelicula) REFERENCES peliculas(id_pelicula),
    UNIQUE KEY unique_user_movie (id_usuario, id_pelicula)
);