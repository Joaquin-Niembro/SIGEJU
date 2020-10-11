CREATE DATABASE sigeju;

CREATE TABLE Usuarios(
    id_usuario BIGSERIAL PRIMARY KEY NOT NULL,
    nombre VARCHAR(70) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL
);

INSERT INTO Usuarios(nombre, genero, email, estado,contrasena, rol)
VALUES
('Andres', 'M', 'andres@mail.com', 'activo','password', 'asesor'),
('Marcos', 'M', 'marcos@mail.com', 'inactivo','password', 'asesor'),
('Carlos', 'M', 'carlos@mail.com', 'activo','password', 'administrador'),
('Monica', 'F', 'monica@mail.com', 'activo','password', 'asesor');

CREATE TABLE Victima(
    id_victima BIGSERIAL PRIMARY KEY NOT NULL,
    nombre VARCHAR(70) NOT NULL,
    apellido VARCHAR(70) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL
);

INSERT INTO Victima(nombre, apellido, genero, email, estado)
VALUES
('Andrea', 'Martinez', 'F', 'andrea@mail.com', 'activo'),
('Manuel', 'Montes', 'M', 'manu@mail.com', 'activo'),
('Carlos', 'Fernandez', 'M', 'charles@mail.com', 'inactivo'),
('Antonio', 'Sanchez', 'M', 'sant@mail.com', 'activo'),
('Carla', 'Robles', 'F', 'carlita@mail.com', 'inactivo');

CREATE TABLE Caso(
    id_caso BIGSERIAL PRIMARY KEY NOT NULL,
    nombre_caso VARCHAR(70) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    usuario_Asesor INT NOT NULL,
    victima_caso INT NOT NULL,
    CONSTRAINT fk_usuario_Caso foreign key (usuario_Asesor) references Usuarios(id_usuario) on delete no action on update cascade,
	constraint fk_victima_Caso foreign key (victima_caso) references Victima(id_victima) on delete no action on update cascade
);

INSERT INTO Caso(nombre_caso, descripcion, estado, usuario_Asesor, victima_caso)
VALUES
('Robo armado', 'Asalto en propiedad privada', 'activo', '15', '1'),
('Divorcio', 'Separación de matrimonio', 'activo', '4', '4'),
('Pension', 'División de bienes', 'inactivo', '2', '5'),
('Demanda laboral', 'Demanda por vialacióna derechos de trabajador', 'inactivo', '2', '3');

CREATE TABLE Audiencia(
    id_audiencia BIGSERIAL PRIMARY KEY NOT NULL,
    fecha DATE NOT NULL,
    lugar VARCHAR(80) NOT NULL,
    hora TIME NOT NULL,
    caso INT NOT NULL,
    constraint fk_caso_audiencia foreign key (caso) references Caso(id_caso) on delete no action on update cascade
);

INSERT INTO Audiencia(fecha, lugar, hora, caso)
VALUES
('2020-10-12', 'Capital local', '14:00:00','21'),
('2020-10-21', 'Capital local', '09:00:00','2'),
('2020-10-18', 'Capital Foranea', '11:00:00','3'),
('2020-11-11', 'Capital local', '16:00:00','2');