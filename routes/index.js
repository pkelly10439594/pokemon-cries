const path = require('path');
const listRoutes = require('./list');

const constructorMethod = (app) => {
    app.use('/list', listRoutes);

    app.use('/', async (req, res) => { //change this
        res.render('pokemon-cries/landing', {title: "Landing page"});
    });
};

module.exports = constructorMethod;
