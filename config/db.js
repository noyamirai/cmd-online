/* eslint-disable no-undef */
require('dotenv').config();

const mongoose = require('mongoose');
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_NAME}.8oeua.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const connectDb = async () => {
    try {
        await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

        console.log('DB connected');     
    } catch (error) {
        console.log(`error occured while trying to connect to db: ${error}`);
        throw error;
    }
};

module.exports = {
    connectDb
};
