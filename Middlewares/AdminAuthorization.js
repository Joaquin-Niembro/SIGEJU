const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
	try {
		const token = req.header('token');
		if (!token) {
			return res.json({ message: 'No hay autorización' });
		} else {
			const payload = jwt.verify(token, 'secret');
			if (!payload) return res.json({ message: 'No hay autorización' });
			if (payload.rol !== 'administrador')return res.json({ message: 'No hay autorización' });
			req.usuario = payload.usuario;
			req.rol = payload.rol;
			next();
		}
	} catch (err) {
		console.error(err.message);
		return res.status(403).json({ message: 'No hay autorización' });
	}
};
