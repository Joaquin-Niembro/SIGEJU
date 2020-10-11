const express = require('express');
const cors = require('cors');

////Initializations
const app = express();
const PORT = process.env.PORT || 5000;
//Database
require('./DB');
////Middlewares
app.use(express.json());
app.use(cors());

///Routes
app.get('/', (req, res) => {
	res.json({ message: 'SIGEJU API' });
});
////Asesores
app.use('/', require('./Routes/Auth'));
app.use('/asesores', require('./Routes/Asesor'));
app.use('/administradores', require('./Routes/Administrador'));
app.use('/casos', require('./Routes/Casos'));
app.use('/victimas', require('./Routes/Victimas'));
app.use('/audiencias', require('./Routes/Audiencias'));
/////Server
app.listen(PORT, () => {
	console.log(`Server on Port ${PORT}`);
});
