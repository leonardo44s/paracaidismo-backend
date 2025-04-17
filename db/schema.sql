-- Crear base de datos
CREATE DATABASE IF NOT EXISTS paracaidismo_db;
USE paracaidismo_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('usuario', 'instructor', 'admin') DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de eventos de paracaidismo
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  lugar VARCHAR(200) NOT NULL,
  capacidad INT NOT NULL,
  instructor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de inscripciones a eventos
CREATE TABLE IF NOT EXISTS inscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'completada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
-- Tabla para reseñas de usuarios
CREATE TABLE IF NOT EXISTS resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  aprobada BOOLEAN DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla para cursos
CREATE TABLE IF NOT EXISTS cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  nivel VARCHAR(50) NOT NULL,
  duracion VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  instructor_id INT,
  imagen VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla para mensajes de contacto
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para información de la página
CREATE TABLE IF NOT EXISTS info_pagina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seccion VARCHAR(50) NOT NULL UNIQUE,
  contenido TEXT NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Tabla para inscripciones a cursos
CREATE TABLE IF NOT EXISTS inscripciones_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_preferida DATE NOT NULL,
  comentarios TEXT,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'completada', 'cancelada') DEFAULT 'pendiente',
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- Insertar información inicial
INSERT INTO info_pagina (seccion, contenido) VALUES 
('sobre_nosotros', '{"titulo": "Sobre Nosotros", "contenido": "Somos un club de paracaidismo con más de 10 años de experiencia...", "imagen": "/placeholder.svg?height=400&width=600"}'),
('quienes_somos', '{"titulo": "Quiénes Somos", "contenido": "Nuestro equipo está formado por profesionales con amplia experiencia en el paracaidismo..."}'),
('contacto', '{"direccion": "Av. Principal 123, Ciudad", "telefono": "+1234567890", "email": "info@paracaidismo.com", "horario": "Lunes a Viernes: 9am - 6pm, Sábados: 10am - 2pm"}');


-- Insertar usuario administrador por defecto (contraseña: admin123)
INSERT INTO usuarios (nombre, apellido, email, password, rol)
VALUES ('Admin', 'Sistema', 'admin@paracaidismo.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.MPaOzW/yU1WH.ECcBGQsAF/oBnf2m86', 'admin');

-- Insertar instructor por defecto (contraseña: admin123)
INSERT INTO usuarios (nombre, apellido, email, password, rol)
VALUES ('Deivinson', 'Vargas', 'instructor@paracaidismo.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.MPaOzW/yU1WH.ECcBGQsAF/oBnf2m86', 'instructor');
