const path = require('path');

const constructorMethod = (app) => {
    app.use('/', async (req, res) => {
        res.render('pokemon-cries/index', {title: "yooo"});
    });
};

module.exports = constructorMethod;
