(function ($) {
    var dropdown = $("#dropdown");
    var quizInput = $("#quizInput");
    var quizAudio = $("#quizAudio");
    var answerImg = $("#answerImg");
    var pkmn = POKEMON.flat(2);
    var indices = [...pkmn.keys()];

    function findId(mon) {
        // if the pokemon has multiple forms with the same cry
        if (Array.isArray(mon)) {
            for (let [i, cry] of POKEMON.flat(1).entries())
                if (Array.isArray(cry))
                    for (let j of cry)
                        if (j[0].indexOf(mon[0]) > -1)
                            if (POKEMON.flat(1)[i][0] === mon[0].substring(0, mon[0].indexOf(DELIMITER)))
                                return [`${j[0].substring(0, j[0].indexOf(DELIMITER))} (${j[0].substring(j[0].indexOf(DELIMITER) + 1)})`,
                                        `${("000" + (i + 1)).slice(-4)}${j[0].substring(j[0].indexOf(DELIMITER)).toLowerCase()}`];
                            else
                                return [j[0].indexOf(DELIMITER) > -1
                                            ? j[0].substring(0, j[0].indexOf(DELIMITER))
                                            : j[0],
                                        `${("000" + (i + 1)).slice(-4)}`];
            return -1;
        }
        // if the pokemon cry is a unique form of a pokemon
        for (let [i, cry] of POKEMON.flat(1).entries()) {
            if (cry === mon)
                return [mon, `${("000" + (i + 1)).slice(-4)}`];
            else
                for (let j of cry)
                    if (j === mon)
                        return [mon.indexOf(DELIMITER) === -1
                                    ? mon
                                    : `${mon.substring(0, mon.indexOf(DELIMITER))} (${mon.substring(mon.indexOf(DELIMITER) + 1)})`,
                                `${("000" + (i + 1)).slice(-4)}${mon.indexOf(DELIMITER) > -1
                                                                    ? mon.substring(mon.indexOf(DELIMITER)).toLowerCase()
                                                                    : ""}`];
        }
        return -1;
    }

    // shuffle the indices (Fisher-Yates algorithm)
    for (let i = indices.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let mon = pkmn[indices[0]];
    let [answer, id] = findId(mon);
    quizAudio.attr("src", `/public/cries/${id.replace("%", "%25")}.mp3`);
    quizAudio.trigger("play");
    quizInput.select();

    quizInput.focus(function() {
        // this will be for the dropdown
    });

    quizInput.keyup(function (event) {
        event.preventDefault();
        if (event.which === 13) { // enter key
            let response = quizInput.val();

            if (response === answer)
                answerImg.html(answer);
        }
    });
})(window.jQuery);
