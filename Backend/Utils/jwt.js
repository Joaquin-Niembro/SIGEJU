const jwt = require('jsonwebtoken');


function jwtGenerator(id_usuario, rol){
    const payload = {
        usuario: id_usuario,
        rol: rol
    }
    return jwt.sign(payload, 'secret', {
        expiresIn: '1hr'
    })
}

module.exports = jwtGenerator;