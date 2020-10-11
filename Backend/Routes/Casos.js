const express = require('express');
const router = express.Router();
const pool = require('../DB');
const { check, validationResult } = require('express-validator');

const Authorization = require('../Middlewares/Authorization');
///Todos los casos
router.get('/', [Authorization], async (req, res) => {
	try {
		const query = await pool.query('SELECT * FROM Caso');
		if (query.rows.length === 0) {
			return res.json({ message: 'No hay casos' });
		} else {
			res.json(query.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Un caso
router.get('/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const query = await pool.query('SELECT * FROM Caso WHERE id_caso = $1', [
			id,
		]);
		if (query.rows.length === 0) {
			return res.json({ message: 'No se encontró ningún caso' });
		} else {
			res.json(query.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
/// actualizar de activo/inactivo
router.put('/estado/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const caso = await pool.query(
			'SELECT estado FROM Caso WHERE id_caso = $1 ',
			[id]
		);
		if (caso.rows.length === 0) {
			return res.json({ message: 'El caso no existe' });
		}
		const estado = caso.rows[0].estado;
		if (estado === 'activo') {
			await pool.query('UPDATE Caso SET estado = $1 WHERE id_caso = $2', [
				'inactivo',
				id,
			]);
			res.json({ message: 'Cambiado a Inactivo' });
		} else {
			if (estado === 'inactivo') {
				await pool.query('UPDATE Caso SET estado = $1 WHERE id_caso = $2', [
					'activo',
					id,
				]);
				res.json({ message: 'Cambiado a Activo' });
			}
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Crear Caso
router.post(
	'/',
	[
		Authorization,
		check('nombre_caso')
			.isString()
			.isLength({ min: 5 })
			.withMessage('Mínimo 5 caractéres'),
		check('descripcion')
			.isString()
			.isLength({ min: 15, max: 150 })
			.withMessage('15-150 caractéres disponibles'),
		check('usuario_Asesor').isInt().withMessage('Debe ser número entero'),
		check('victima_caso').isInt().withMessage('Debe ser número entero'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const {
				nombre_caso,
				descripcion,
				usuario_Asesor,
				victima_caso,
			} = req.body;
			const estado = 'activo';
			///revisra si  el asesor y la victima existen
			const asesorExists = await pool.query(
				'SELECT * FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
				[usuario_Asesor, 'asesor']
			);
			const victimaExists = await pool.query(
				'SELECT * FROM Victima WHERE id_victima = $1',
				[victima_caso]
			);
			if (asesorExists.rows.length === 0 || victimaExists.rows.length === 0) {
				return res.json({ message: 'Asesor o Victima errónea' });
			} else {
				const query = {
					text:
						'INSERT INTO Caso(nombre_caso, descripcion, estado, usuario_Asesor, victima_caso)VALUES($1,$2,$3,$4,$5) RETURNING *',
					values: [
						nombre_caso,
						descripcion,
						estado,
						usuario_Asesor,
						victima_caso,
					],
				};
				const caso = await pool.query(query);
				res.json(caso.rows);
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
///casos activos/inactivos
router.get('/estado/:state', [Authorization], async (req, res) => {
	try {
		const { state } = req.params;
		const query = await pool.query('SELECT * FROM Caso WHERE estado = $1', [
			state,
		]);
		if (query.rows.length === 0) {
			return res.json({ message: 'No se encontró ningún caso' });
		} else {
			res.json(query.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
///Actualizar caso
router.put(
	'/:id',
	[
		Authorization,
		check('nombre_caso')
			.isString()
			.isLength({ min: 5 })
			.withMessage('Mínimo 5 caractéres'),
		check('descripcion')
			.isString()
			.isLength({ min: 15, max: 150 })
			.withMessage('15-150 caractéres disponibles'),
		check('usuario_Asesor').isInt().withMessage('Debe ser número entero'),
		check('victima_caso').isInt().withMessage('Debe ser número entero'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { id } = req.params;
			const {
				nombre_caso,
				descripcion,
				usuario_Asesor,
				victima_caso,
				estado,
			} = req.body;
			///revisra si  el asesor y la victima existen
			const asesorExists = await pool.query(
				'SELECT * FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
				[usuario_Asesor, 'asesor']
			);
			const victimaExists = await pool.query(
				'SELECT * FROM Victima WHERE id_victima = $1',
				[victima_caso]
			);
			if (asesorExists.rows.length === 0 || victimaExists.rows.length === 0) {
				return res.json({ message: 'Asesor o Victima errónea' });
			} else {
				const query = {
					text:
						'UPDATE Caso SET nombre_caso = $1, descripcion = $2, estado = $3, usuario_Asesor = $4, victima_caso = $5 WHERE id_caso = $6',
					values: [
						nombre_caso,
						descripcion,
						estado,
						usuario_Asesor,
						victima_caso,
						id,
					],
				};
				await pool.query(query);
				res.json({ message: 'Caso actualizado!' });
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
module.exports = router;
