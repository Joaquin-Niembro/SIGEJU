const bcrypt = require('bcryptjs')

const hashPassword = async (passwrod) =>{
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(passwrod, salt);
    return hashPassword;
}
const hashCompare = async (passwrod, hash) =>{
    return await bcrypt.compare(passwrod, hash);
}
module.exports = {hashPassword, hashCompare};