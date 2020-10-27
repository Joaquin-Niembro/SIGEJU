const express = require('express');
const router = express.Router();
const pool = require('../DB');
const { hashPassword } = require('../Utils/Bcrypt');
const { check, validationResult } = require('express-validator');
const AdminAuthorization = require('../Middlewares/AdminAuthorization');

///Todos los administradores
router.get('/', [AdminAuthorization], async (req, res) => {
	const query = await pool.query('SELECT * FROM Usuarios WHERE rol = $1', [
		'administrador',
	]);
	res.json(query.rows);
});
///Crear admin
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
			const rol = 'administrador';
			const estado = 'activo';
			const hash = await hashPassword(contraseña);
			const query = {
				text: 'SELECT * FROM Usuarios WHERE email = $1 AND rol = $2',
				values: [email, rol],
			};
			const userExists = await pool.query(query);
			if (userExists.rows.length > 0) {
				return res.json({ message: 'El administrador ya existe' });
			} else {
				const queryAdmin = {
					text:
						'INSERT INTO Usuarios(nombre,genero,email,estado,rol,contrasena)VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
					values: [nombre, genero, email, estado, rol, hash],
				};
				const administrador = await pool.query(queryAdmin);
				res.json(administrador.rows);
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//Cambiar estado activo/inactivo
router.put('/estado/:id', [AdminAuthorization], async (req, res) => {
	try {
		const { id } = req.params;
		const user = await pool.query(
			'SELECT estado FROM Usuarios WHERE id_usuario = $1',
			[id]
		);
		if (user.rows.length === 0) {
			res.json({ message: 'El asesor no existe' });
		}
		const estado = user.rows[0].estado;
		if (estado === 'activo') {
			await pool.query(
				'UPDATE Usuarios SET estado = $1 WHERE id_usuario = $2',
				['inactivo', id]
			);
			res.json({ message: 'Cambiado a Inactivo' });
		} else {
			if (estado === 'inactivo') {
				await pool.query(
					'UPDATE Usuarios SET estado = $1 WHERE id_usuario = $2',
					['activo', id]
				);
				res.json({ message: 'Cambiado a Activo' });
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
///Un administrador
router.get('/:id', [AdminAuthorization], async (req, res) => {
	try {
		const { id } = req.params;
		const admin = await pool.query(
			'SELECT nombre, genero, email, estado, rol FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[id, 'administrador']
		);
		if (admin.rows.length === 0) {
			return res.json({ message: 'Administrador no encontrado' });
		} else {
			res.json(admin.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
///Actualizar admin
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
				[id, 'administrador']
			);
			if (userExists.rows.length === 0) {
				return res.json({ message: 'El administrador no existe' });
			} else {
				const query = {
					text:
						'UPDATE Usuarios SET nombre = $1, genero = $2, email = $3, estado = $4 WHERE id_usuario = $5 AND rol = $6',
					values: [nombre, genero, email, estado, id, 'administrador'],
				};
				await pool.query(query);
				res.json({ message: 'Administrador actualizado!' });
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);

module.exports = router;
