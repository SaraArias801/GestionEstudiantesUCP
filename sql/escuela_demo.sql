DROP DATABASE IF EXISTS escuela_demo;
CREATE DATABASE escuela_demo
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE escuela_demo;

CREATE TABLE estudiantes (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(50)  NOT NULL,
  apellido     VARCHAR(50)  NOT NULL,
  edad         TINYINT UNSIGNED NOT NULL,
  grado        VARCHAR(10)  NOT NULL,
  curso        VARCHAR(10)  NULL,
  email        VARCHAR(120) NOT NULL UNIQUE,
  telefono     VARCHAR(20)  NULL,
  nota_p1      DECIMAL(3,2) NOT NULL,
  nota_p2      DECIMAL(3,2) NOT NULL,
  nota_p3      DECIMAL(3,2) NOT NULL,
  nota_p4      DECIMAL(3,2) NOT NULL,
  promedio     DECIMAL(4,2)
               GENERATED ALWAYS AS (ROUND((nota_p1 + nota_p2 + nota_p3 + nota_p4)/4, 2)) STORED,
  estado       VARCHAR(10)
               GENERATED ALWAYS AS (
                 IF(((nota_p1 + nota_p2 + nota_p3 + nota_p4)/4) >= 3.00, 'aprobado', 'reprobado')
               ) VIRTUAL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (edad BETWEEN 5 AND 100),
  CHECK (nota_p1 BETWEEN 0 AND 5),
  CHECK (nota_p2 BETWEEN 0 AND 5),
  CHECK (nota_p3 BETWEEN 0 AND 5),
  CHECK (nota_p4 BETWEEN 0 AND 5)
);

CREATE INDEX idx_estudiantes_apellido ON estudiantes (apellido);
CREATE INDEX idx_estudiantes_grado   ON estudiantes (grado);

INSERT INTO estudiantes
(nombre, apellido, edad, grado, curso, email, telefono, nota_p1, nota_p2, nota_p3, nota_p4)
VALUES
('Sofia', 'Gomez', 12, '6', 'A', 'sofia.gomez@escuela.test', '3001111111', 4.50, 4.20, 4.70, 4.30),
('Mateo', 'Ramirez', 13, '7', 'B', 'mateo.ramirez@escuela.test', '3001111112', 3.10, 3.40, 3.00, 3.20),
('Valentina', 'Lopez', 14, '8', 'A', 'valentina.lopez@escuela.test', '3001111113', 4.80, 4.60, 4.90, 4.70),
('Santiago', 'Torres', 15, '9', 'C', 'santiago.torres@escuela.test', '3001111114', 2.80, 2.90, 3.10, 2.70),
('Isabella', 'Martinez', 16, '10', 'A', 'isabella.martinez@escuela.test', '3001111115', 3.80, 3.60, 3.90, 4.00),
('Sebastian', 'Perez', 17, '11', 'B', 'sebastian.perez@escuela.test', '3001111116', 2.40, 2.80, 2.60, 2.90),
('Camila', 'Suarez', 12, '6', 'B', 'camila.suarez@escuela.test', '3001111117', 4.10, 3.90, 4.20, 4.00),
('Samuel', 'Vargas', 13, '7', 'C', 'samuel.vargas@escuela.test', '3001111118', 3.20, 3.10, 3.40, 3.30),
('Mariana', 'Castro', 14, '8', 'A', 'mariana.castro@escuela.test', '3001111119', 4.70, 4.50, 4.60, 4.80),
('Juan', 'Hernandez', 15, '9', 'B', 'juan.hernandez@escuela.test', '3001111120', 3.50, 3.20, 3.60, 3.40),
('Andrea', 'Mendoza', 16, '10', 'C', 'andrea.mendoza@escuela.test', '3001111121', 4.30, 4.10, 4.20, 4.40),
('Nicolas', 'Moreno', 17, '11', 'A', 'nicolas.moreno@escuela.test', '3001111122', 2.90, 3.00, 2.80, 3.10),
('Laura', 'Rojas', 12, '6', 'C', 'laura.rojas@escuela.test', '3001111123', 4.20, 4.00, 4.10, 4.30),
('Diego', 'Cardenas', 13, '7', 'A', 'diego.cardenas@escuela.test', '3001111124', 3.00, 2.80, 3.10, 2.90),
('Daniela', 'Ortega', 14, '8', 'B', 'daniela.ortega@escuela.test', '3001111125', 4.60, 4.40, 4.70, 4.50),
('Gabriel', 'Reyes', 15, '9', 'A', 'gabriel.reyes@escuela.test', '3001111126', 3.40, 3.50, 3.30, 3.20),
('Lucia', 'Benitez', 16, '10', 'B', 'lucia.benitez@escuela.test', '3001111127', 4.00, 3.90, 4.10, 4.20),
('Carlos', 'Sanchez', 17, '11', 'C', 'carlos.sanchez@escuela.test', '3001111128', 2.70, 2.60, 2.80, 2.50),
('Paula', 'Garcia', 12, '6', 'A', 'paula.garcia@escuela.test', '3001111129', 4.40, 4.30, 4.50, 4.20),
('Felipe', 'Delgado', 13, '7', 'B', 'felipe.delgado@escuela.test', '3001111130', 3.10, 3.20, 3.00, 3.30),
('Adriana', 'Cortes', 14, '8', 'C', 'adriana.cortes@escuela.test', '3001111131', 4.90, 4.80, 4.70, 4.90),
('Julian', 'Gil', 15, '9', 'B', 'julian.gil@escuela.test', '3001111132', 3.60, 3.40, 3.50, 3.70),
('Fernanda', 'Peña', 16, '10', 'A', 'fernanda.pena@escuela.test', '3001111133', 4.10, 4.20, 4.00, 4.10),
('Hector', 'Camacho', 17, '11', 'B', 'hector.camacho@escuela.test', '3001111134', 2.50, 2.70, 2.60, 2.80),
('Diana', 'Salazar', 12, '6', 'B', 'diana.salazar@escuela.test', '3001111135', 4.30, 4.50, 4.20, 4.40),
('Tomas', 'Navarro', 13, '7', 'C', 'tomas.navarro@escuela.test', '3001111136', 3.20, 3.10, 3.30, 3.40),
('Karina', 'Arango', 14, '8', 'A', 'karina.arango@escuela.test', '3001111137', 4.20, 4.10, 4.30, 4.40),
('Miguel', 'Acosta', 15, '9', 'C', 'miguel.acosta@escuela.test', '3001111138', 2.90, 3.10, 2.80, 3.00),
('Sara', 'Bermudez', 16, '10', 'B', 'sara.bermudez@escuela.test', '3001111139', 4.50, 4.60, 4.40, 4.70),
('Andres', 'Quintero', 17, '11', 'A', 'andres.quintero@escuela.test', '3001111140', 3.00, 2.90, 3.10, 3.20);
