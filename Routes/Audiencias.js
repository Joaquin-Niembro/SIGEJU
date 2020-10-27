const express = require('express');
const router = express.Router();
const pool = require('../DB');
const AdminAuthorization = require('../Middlewares/AdminAuthorization');
const Authorization = require('../Middlewares/Authorization');
const { check, validationResult } = require('express-validator');
////Todas las audiencias
router.get('/', [Authorization], async (req, res) => {
	try {
		const audiencias = await pool.query('SELECT * FROM Audiencia');
		if (audiencias.rows.length === 0) {
			return res.json({ message: 'No hay audiencias' });
		} else {
			res.json(audiencias.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
//Una audiencia
router.get('/:id', [AdminAuthorization], async (req, res) => {
	try {
		const { id } = req.params;
		const audiencia = await pool.query(
			'SELECT * FROM Audiencia WHERE id_audiencia = $1',
			[id]
		);
		if (audiencia.rows.length === 0) {
			return res.json({ message: 'No se encontró audiencia' });
		} else {
			res.json(audiencia.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
var regex = new RegExp(/^(10|11|12|[1-9]):[0-5][0-9]$/);
//Crear audiencia
router.post(
	'/',
	[
		Authorization,
		
		check('lugar').isString().isLength({ min: 5, max: 80 }),
		//check('hora').matches(regex),
		check('caso').isNumeric(),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { fecha, lugar, hora, caso } = req.body;
			const casoExists = await pool.query(
				'SELECT * FROM Caso WHERE id_caso = $1',
				[caso]
			);
			if (casoExists.rows.length === 0) {
				return res.json({ message: 'El caso no existe' });
			} else {
				const query = {
					text:
						'INSERT INTO Audiencia(fecha, lugar, hora, caso)VALUES($1,$2,$3,$4) RETURNING *',
					values: [fecha, lugar, hora, caso],
				};
				const Res = await pool.query(query);
				res.json(Res.rows);
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//Actualizar audiencia
router.put(
	'/:id',
	[
		[
			Authorization,
			
			check('lugar').isString().isLength({ min: 5, max: 80 }),
			
			check('caso').isNumeric(),
		],
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { id } = req.params;
			const { fecha, lugar, hora, caso } = req.body;
			const audienciaExists = await pool.query(
				'SELECT * FROM Audiencia WHERE id_audiencia = $1',
				[id]
			);
			if (audienciaExists.rows.length === 0) {
				return res.json({ message: 'La audiencia no existe' });
			} else {
				const casoExists = await pool.query(
					'SELECT * FROM Caso WHERE id_caso = $1',
					[caso]
				);
				if (casoExists.rows.length === 0) {
					return res.json({ message: 'El caso no existe' });
				} else {
					const query = {
						text:
							'UPDATE Audiencia SET fecha = $1, lugar = $2, hora = $3, caso = $4 WHERE id_audiencia = $5',
						values: [fecha, lugar, hora, caso, id],
					};
					await pool.query(query);
					res.json({ message: 'Audiencia actualizada!' });
				}
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ message: 'Server Error' });
		}
	}
);
//Eliminar AUDIENCIA
router.delete('/:id', [Authorization], async (req, res) => {
	try {
		const { id } = req.params;
		const audiencia = await pool.query(
			'SELECT * FROM Audiencia WHERE id_audiencia = $1',
			[id]
		);
		if (audiencia.rows.length === 0) {
			return res.json({ message: 'La audiencia no existe' });
		} else {
			await pool.query('DELETE FROM Audiencia WHERE id_audiencia = $1', [id]);
			res.json({ message: 'La audiencia se ha eliminado!' });
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: 'Server Error' });
	}
});
module.exports = router;
