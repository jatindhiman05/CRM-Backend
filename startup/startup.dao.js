'use strict';

const fetchAnyAdmin = async (mysql) => {
    const query = `
        SELECT id 
        FROM users 
        WHERE user_type = 'ADMIN'
        LIMIT 1
    `;
    const [rows] = await mysql.query(query);
    return rows.length ? rows[0] : null;
};

const createAdmin = async (mysql, admin) => {
    const query = `
        INSERT INTO users
        (name, user_id, email, password, user_type, user_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    return mysql.query(query, [
        admin.name,
        admin.userId,
        admin.email,
        admin.password,
        admin.userType,
        admin.userStatus
    ]);
};

module.exports = {
    fetchAnyAdmin,
    createAdmin
};
