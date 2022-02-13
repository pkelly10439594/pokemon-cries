const express = require('express');
const router = express.Router();
const AMT_OF_GENS = 8;

router.get('/', async (req, res) => {
    res.render('pokemon-cries/list', {title: "Pokémon Repository"});
});

router.get('/:generation', async (req, res) => {
    let gen = +req.params.generation;
    if (Number.isInteger(gen) && gen >= 1 && gen <= AMT_OF_GENS) {
        res.render(`pokemon-cries/gen${gen}`, {title: `Pokémon Repository: Generation ${gen}`});
    } else {
        res.render('pokemon-cries/fourohfour', {title: "404"});
    }
});

module.exports = router;
