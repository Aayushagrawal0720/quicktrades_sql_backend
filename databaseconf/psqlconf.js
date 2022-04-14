const { Pool } = require('pg');

var pool = new Pool({
    user: 'postgres',
    host: '172.26.12.12',
    database: 'quicktrades',
    password: 'postgres',
    port: 5432,
});

module.exports = pool;
