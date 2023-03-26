const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    init: () => {
        const dbSetting = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        };

    mongoose.connect(process.env.MONDONGO);
    //mongoose.set('strictQuery', false);
    mongoose.Promise = global.Promise;

    mongoose.connection.on('connected', () => {
        console.log('I connected with MONDONGO (db) c:');
    });

    mongoose.connection.on('disconnected', () => {
        console.log('[WARNING] I´ve lost connection with MONDONGO (db) :?');
    });

    mongoose.connection.on('err', (err) => {
        console.log('[FATAL] I had an error connecting with MONDONGO (db) >:c' + err);
    });
        
    }
}