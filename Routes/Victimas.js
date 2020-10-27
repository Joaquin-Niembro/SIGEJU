const express = require('express');
const router = express.Router();
const pool = require('../DB');
const { check, validationResult } = require('express-validator');

const Authorization = require('../Middlewares/Authorization');
///Todas las victimas
router.get('/', [Authorization], async (req, res) => {
	try {
		const Res = await pool.query('SELECT * FROM Victima');
		if (Res.rows.length === 0) {
			return res.json({ message: 'No hay victimas' });
		} else {
			res.json(Res.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//una victima
router.get('/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const victima = await pool.query(
			'SELECT * FROM Victima WHERE id_victima = $1',
			[id]
		);
		if (victima.rows.length === 0) {
			return res.json({ message: 'La victima no existe' });
		} else {
			res.json(victima.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Victimas activas/inactivas
router.get('/estado/:state', [Authorization], async (req, res) => {
	try {
		const { state } = req.params;
		const query = await pool.query('SELECT * FROM Victima WHERE estado = $1', [
			state,
		]);
		if (query.rows.length === 0) {
			return res.json({ message: 'No se encontró ningúna victima' });
		} else {
			res.json(query.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Cambiar de activo/inactivo
router.put('/estado/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const victima = await pool.query(
			'SELECT estado FROM Victima WHERE id_victima = $1 ',
			[id]
		);
		if (victima.rows.length === 0) {
			return res.json({ message: 'La victima no existe' });
		}
		const estado = victima.rows[0].estado;
		if (estado === 'activo') {
			await pool.query('UPDATE Victima SET estado = $1 WHERE id_victima = $2', [
				'inactivo',
				id,
			]);
			res.json({ message: 'Cambiado a Inactivo' });
		} else {
			if (estado === 'inactivo') {
				await pool.query(
					'UPDATE Victima SET estado = $1 WHERE id_victima = $2',
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
//Crear victima
router.post(
	'/',
	[
		Authorization,
		check('nombre')
			.isString()
			.withMessage('Nombre deber ser solo letras')
			.isLength({ min: 4, max: 70 })
			.withMessage('Nombre debe ser mínimo 4 caractéres'),
		check('apellido')
			.isString()
			.withMessage('Nombre deber ser solo letras')
			.isLength({ min: 4, max: 70 })
			.withMessage('Nombre debe ser mínimo 4 caractéres'),
		check('genero').isUppercase().isLength({ max: 1 }),
		check('email').isEmail().withMessage('El formato del email no es válido'),
	],
	async (req, res) => {
		try {
			const { nombre, apellido, genero, email } = req.body;
			const estado = 'activo';
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const victimaExists = await pool.query(
				'SELECT * FROM Victima WHERE email = $1',
				[email]
			);
			if (victimaExists.rows.length > 0) {
				return res.json({ message: 'La victima ya existe' });
			} else {
				const query = {
					text:
						'INSERT INTO Victima(nombre, apellido, genero, email, estado) VALUES($1,$2,$3,$4,$5) RETURNING *',
					values: [nombre, apellido, genero, email, estado],
				};
				const victima = await pool.query(query);
				res.json(victima.rows);
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//actualizar victima
router.put(
	'/:id',
	[
		Authorization,
		check('nombre')
			.isString()
			.withMessage('Nombre deber ser solo letras')
			.isLength({ min: 4, max: 70 })
			.withMessage('Nombre debe ser mínimo 4 caractéres'),
		check('apellido')
			.isString()
			.withMessage('Nombre deber ser solo letras')
			.isLength({ min: 4, max: 70 })
			.withMessage('Nombre debe ser mínimo 4 caractéres'),
		check('genero').isUppercase().isLength({ max: 1 }),
		check('email').isEmail().withMessage('El formato del email no es válido'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { id } = req.params;
			const { nombre, apellido, genero, email, estado } = req.body;
			const userExists = await pool.query(
				'SELECT * FROM Victima WHERE id_victima = $1',
				[id]
			);
			
			if (userExists.rows.length === 0) {
				return res.json({ message: 'la victima no existe' });
			} else {
				
				const query = {
					text:
						'UPDATE Victima SET nombre = $1,apellido = $2, genero = $3, email = $4, estado = $5 WHERE id_victima = $6',
					values: [nombre, apellido, genero, email, estado, id],
				};
				await pool.query(query);
				res.json({ message: 'Victima actualizada!' });
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//Casos de la victima
router.get('/casos/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const victimaExists = await pool.query(
			'SELECT * FROM Victima WHERE id_victima = $1',
			[id]
		);
		if (victimaExists.rows.length === 0) {
			return res.json({ message: 'La victima no existe' });
		} else {
			const casos = await pool.query(
				'SELECT * FROM Caso WHERE victima_caso = $1',
				[id]
			);
			if (casos.rows.length === 0) {
				return res.json({ message: 'La victima no tiene casos' });
			} else {
				res.json(casos.rows);
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
///audiencias de la victima
router.get('/audiencias/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const victima = await pool.query(
			'SELECT * FROM Victima WHERE id_victima= $1',
			[id]
		);
		if (victima.rows.length === 0) {
			return res.json({ message: 'La victima no existe' });
		} else {
			const query =
				'SELECT Audiencia.fecha, Audiencia.caso,Audiencia.lugar,Audiencia.hora, Caso.nombre_caso,Caso.estado, Victima.nombre,Victima.apellido, Victima.id_victima AS idVictima FROM ((Audiencia INNER JOIN Caso ON Audiencia.caso = Caso.id_caso)INNER JOIN Victima ON Victima.id_victima = Caso.victima_caso)WHERE Victima.id_victima = $1;';
			const audiencias = await pool.query(query, [id]);
			if (audiencias.rows.length === 0) {
				return res.json({ message: 'La victima no cuenta con audiencias' });
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
