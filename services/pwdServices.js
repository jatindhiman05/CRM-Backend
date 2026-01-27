const bcrypt = require('bcrypt');

exports.encrypt = async (password) => {
    return bcrypt.hashSync(password, 10);
};

exports.compare = async (plain, hashed) => {
    return bcrypt.compareSync(plain, hashed);
};
