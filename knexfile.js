module.exports = {

    development: {
        client: 'mysql',
        connection: {
            host: process.env.PAIRBUILDER_HOST,
            user: process.env.PAIRBUILDER_USER,
            password: process.env.PAIRBUILDER_PW,
            database: process.env.PAIRBUILDER_DB
        }
    }
}