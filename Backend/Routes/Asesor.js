const express = require('express');
const router = express.Router();
const pool = require('../DB');
const { hashPassword } = require('../Utils/Bcrypt');
const { check, validationResult } = require('express-validator');
const AdminAuthorization = require('../Middlewares/AdminAuthorization');
const Authorization = require('../Middlewares/Authorization');
///Todos los asesores
router.get('/',[AdminAuthorization], async (req, res) => {
	try {
		const query = await pool.query('SELECT * FROM Usuarios WHERE rol = $1', [
			'asesor',
		]);
		if (query.rows.length === 0) {
			return res.json({ message: 'No hay asesores' });
		} else {
			res.json(query.rows[0]);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Un asesor
router.get('/:id',[AdminAuthorization], async (req, res) => {
	try {
		const { id } = req.params;
		const query = await pool.query(
			'SELECT id_usuario, nombre, genero, email, estado, rol FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, 'asesor']
		);
		if (query.rows.length === 0) {
			return res.json({ message: 'No se encontró ningún Asesor' });
		}
		res.json(query.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Crear asesor
router.post(
	'/',
	[
		AdminAuthorization,
		check('contraseña')
			.isLength({ min: 5 })
			.withMessage('Contraseña debe ser al menos 5 caractéres'),
		check('email').isEmail().withMessage('El formato del email no es válido'),
		check('nombre')
			.isString()
			.withMessage('Nombre debe contener unicamente letras'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { nombre, genero, email, contraseña } = req.body;
			const rol = 'asesor';
			const estado = 'activo';
			const hash = await hashPassword(contraseña);
			///Revisar si el asesor ya existe
			const query = {
				text: 'SELECT * FROM Usuarios WHERE email = $1 AND rol = $2',
				values: [email, rol],
			};
			const userExists = await pool.query(query);
			if (userExists.rows.length > 0) {
				res.json({ message: 'El asesor ya existe' });
			} else {
				////Crear asesor
				const queryAsesor = {
					text:
						'INSERT INTO Usuarios(nombre,genero,email,estado,rol,contrasena)VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
					values: [nombre, genero, email, estado, rol, hash],
				};
				const asesor = await pool.query(queryAsesor);
				res.json(asesor.rows[0]);
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
///Cambiar estado de asesor de activo/inactivo
router.put('/estado/:id',[AdminAuthorization], async (req, res) => {
	try {
		const { id } = req.params;
		const user = await pool.query(
			'SELECT estado FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, 'asesor']
		);
		if (user.rows.length === 0) {
			return res.json({ message: 'El asesor no existe' });
		}
		const estado = user.rows[0].estado;
		if (estado === 'activo') {
			await pool.query(
				'UPDATE Usuarios SET estado = $1 WHERE id_usuario = $2 AND rol = $3',
				['inactivo', id, 'asesor']
			);
			res.json({ message: 'Cambiado a Inactivo' });
		} else {
			if (estado === 'inactivo') {
				await pool.query(
					'UPDATE Usuarios SET estado = $1 WHERE id_usuario = $2 AND rol = $3',
					['activo', id, 'asesor']
				);
				res.json({ message: 'Cambiado a Activo' });
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});

///Actualizar asesor
router.put(
	'/:id',
	[
		AdminAuthorization,
		check('email').isEmail().withMessage('El formato del email no es válido'),
		check('nombre')
			.isString()
			.withMessage('Nombre debe contener unicamente letras'),
		check('genero').isString().isUppercase().withMessage('Mayúscula'),
		check('estado').isString().withMessage('Estado debe ser activo/inactivo'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { id } = req.params;
			const { nombre, genero, email, estado } = req.body;
			const userExists = await pool.query(
				'SELECT nombre, email FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
				[id, 'asesor']
			);
			if (userExists.rows.length === 0) {
				return res.json({ message: 'El asesor no existe' });
			} else {
				const query = {
					text:
						'UPDATE Usuarios SET nombre = $1, genero = $2, email = $3, estado = $4 WHERE id_usuario = $5 AND rol = $6',
					values: [nombre, genero, email, estado, id, 'asesor'],
				};
				await pool.query(query);
				res.json({ message: 'Asesor actualizado' });
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//Borrar asesor
router.delete('/:id',[AdminAuthorization], async (req, res) => {
	try {
		const { id } = req.params;
		const userExists = await pool.query(
			'SELECT nombre, email FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, 'asesor']
		);
		if (userExists.rows.length === 0) {
			return res.json({ message: 'No se encontró asesor con ese id' });
		} else {
			await pool.query(
				'DELETE FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
				[id, 'asesor']
			);
			res.json({ message: 'Asesor eliminado!' });
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
///asesores activos/inactivos
router.get('/estado/:state',[AdminAuthorization], async (req, res) => {
	try {
		const { state } = req.params;
		const query = await pool.query('SELECT * FROM Usuarios WHERE estado = $1 AND rol = $2', [
			state, 'asesor'
		]);
		if (query.rows.length === 0) {
			return res.json({ message: 'No se encontró ningún asesor' });
		} else {
			res.json(query.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Casos Activos del asesor
router.get('/casos/:id',[Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const asesorExists = await pool.query(
			'SELECT * FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, 'asesor']
		);
		
		if (asesorExists.rows.length === 0) {
			return res.json({ message: 'El asesor no existe' });
		} else {
			const casos = await pool.query(
				'SELECT * FROM Caso WHERE usuario_Asesor = $1 AND estado = $2',
				[id, 'activo']
			);
			if (casos.rows.length === 0) {
				return res.json({ message: 'El asesor no tiene casos' });
			} else {
				res.json(casos.rows);
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
///Casos Inactivos del ASESOR
router.get('/casos/inactivo/:id',[Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const asesorExists = await pool.query(
			'SELECT * FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, 'asesor']
		);
		
		if (asesorExists.rows.length === 0) {
			return res.json({ message: 'El asesor no existe' });
		} else {
			const casos = await pool.query(
				'SELECT * FROM Caso WHERE usuario_Asesor = $1 AND estado = $2',
				[id, 'inactivo']
			);
			if (casos.rows.length === 0) {
				return res.json({ message: 'El asesor no tiene casos' });
			} else {
				res.json(casos.rows);
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});

///Audiencias del asesor
router.get('/audiencias/:id',[Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const rol = 'asesor';
		const asesor = await pool.query(
			'SELECT * FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, rol]
		);
		if (asesor.rows.length === 0) {
			return res.json({ message: 'El asesor no existe' });
		} else {
			const query =
				'SELECT Audiencia.id_audiencia,Audiencia.fecha, Audiencia.caso,Audiencia.lugar,Audiencia.hora, Caso.nombre_caso,Caso.estado, Usuarios.nombre as Asesor, Usuarios.id_usuario as idAsesor FROM ((Audiencia INNER JOIN Caso ON Audiencia.caso = Caso.id_caso)INNER JOIN Usuarios ON Usuarios.id_usuario = Caso.usuario_Asesor)WHERE Usuarios.id_usuario = $1';
			const audiencias = await pool.query(query, [id]);
			if (audiencias.rows.length === 0) {
				return res.json({ message: 'El asesor no cuenta con audiencias' });
			} else {
				res.json(audiencias.rows);
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
module.exports = router;
