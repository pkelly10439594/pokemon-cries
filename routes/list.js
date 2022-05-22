const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('pokemon-cries/list', {title: "Pokémon Repository"});
});

module.exports = router;
