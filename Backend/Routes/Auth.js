const express = require('express');
const router = express.Router();
const pool = require('../DB');
const { hashCompare } = require('../Utils/Bcrypt');
const { check, validationResult } = require('express-validator');
const jwtGenerator = require('../Utils/jwt');

const Authorization = require('../Middlewares/Authorization');
///Iniciar Sesión
router.post(
	'/signin',
	[
		check('email').isEmail().withMessage('Formato de Email invalido'),
		check('password')
			.isLength({ min: 4 })
			.withMessage('5 Caractéres como mínimo'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { email, password } = req.body;
			const usuario = await pool.query(
				'SELECT * FROM Usuarios WHERE email = $1',
				[email]
			);
			if (usuario.rows.length === 0) {
				return res.json({ message: 'Usuario no esta registrado' });
			} else {
				const hash = usuario.rows[0].contrasena;
				const id_usuario = usuario.rows[0].id_usuario;
				const rol = usuario.rows[0].rol;
				const compare = await hashCompare(password, hash);
				if (!compare) {
					return res.json({ message: 'Usuario o contraseña inválido' });
				} else {
					///token
					const token = jwtGenerator(id_usuario, rol);
					res.json({ token });
				}
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//Is verified
router.get('/verificar', Authorization, async (req, res) => {
	try {
		res.json(true);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Datos de req.user
router.get('/usuario', Authorization, async (req, res) => {
	try {
		const usuario = await pool.query(
			'SELECT id_usuario, nombre, genero, email, estado, rol FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
			[req.usuario, req.rol]
		);
		res.json(usuario.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
module.exports = router;
