const path = require('path');

const constructorMethod = (app) => {
    app.use('/', async (req, res) => {
        res.render('pokemon-cries/list', {title: "Pokémon Repository"});
    });
};

module.exports = constructorMethod;
