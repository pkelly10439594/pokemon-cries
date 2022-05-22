const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('pokemon-cries/quiz', {title: "Pokémon Cries Quiz"});
});

module.exports = router;
