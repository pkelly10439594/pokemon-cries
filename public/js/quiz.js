(function ($) {
    var dropdown = $("#dropdown");
    var quizInput = $("#quizInput");
    var quizAudio = $("#quizAudio");
    var answerImg = $("#answerImg");
    var pkmn = POKEMON.flat(2);
    var indices = [...pkmn.keys()];
    var index = 0;
    var correct = false;
    var answer, id, pics;

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
    }

    // shuffle the indices (Fisher-Yates algorithm)
    for (let i = indices.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    function getOneCry(i) {
        answerImg.empty();
        quizInput.val('');
        correct = false;
        let mon = pkmn[indices[i]];
        [answer, id] = findId(mon);
        pics = typeof mon === "string" ? [id] : mon.map(x => x.indexOf(DELIMITER) === -1
                                                                ? id
                                                                : id.split(DELIMITER)[0]
                                                                    + x.substring(x.indexOf(DELIMITER)).toLowerCase());
        quizAudio.attr("src", `/public/cries/${id.replace("%", "%25")}.mp3`);
        quizAudio.trigger("play");
        quizInput.select();
    }

    getOneCry(index);

    quizInput.focus(function() {
        // this will be for the dropdown
    });

    quizInput.keydown(function (event) {
        if (correct) {
            event.preventDefault();
            return;
        }
        if (event.which !== 13) return; // enter key
        event.preventDefault();

        if (quizInput.val() === answer) {
            correct = true;
            pics.forEach(x => answerImg.append($(`<img src="/public/images/${x.replace("%", "%25")}.png" class="revealImg">`)));
            answerImg.append("<br>");
            quizAudio.trigger("play");
            setTimeout(getOneCry, 3000, ++index);
        }
    });
})(window.jQuery);
