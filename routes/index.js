const path = require('path');
const listRoutes = require('./list');
const quizRoutes = require('./quiz');

const constructorMethod = (app) => {
    app.use('/list', listRoutes);
    app.use('/quiz', quizRoutes);

    app.use('/', async (req, res) => { //change this
        res.render('pokemon-cries/landing', {title: "Landing page"});
    });
};

module.exports = constructorMethod;
