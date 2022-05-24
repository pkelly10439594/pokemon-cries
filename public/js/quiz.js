(function ($) {
    var dropdown = $("#dropdown");
    var quizInput = $("#quizInput");
    var quizAudio = $("#quizAudio");
    var answerImg = $("#answerImg");
    var searchResults = $("#searchResults");
    var pkmn = POKEMON.flat(2);
    var indices = [...pkmn.keys()];
    var index = 0;
    var answer, id, pics;
    var answers = POKEMON.flat(2).map((x, i) => typeof x === "string"
                                            ? (!x.includes(DELIMITER) ? x : `${x.replace(DELIMITER, " (")})`)
                                            : (!x[0].includes(DELIMITER) ? x[0] :
                                                x[0].includes(POKEMON.flat(2)[i - 1])
                                                ? `${x[0].replace(DELIMITER, " (")})`
                                                : x[0].substring(0, x[0].indexOf(DELIMITER))))
                                        .sort();

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
        quizInput.attr("readonly", false);
        answerImg.empty();
        quizInput.val('');
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
    for (let x of answers) searchResults.append(`<li class="listItem">${x}</li>`);

    quizInput.focus(function() {
        if (quizInput.is('[readonly]')) return;
        dropdown.show();
    });

    quizInput.focusout(function() {
        dropdown.delay(150).fadeOut(0); // this is incredibly hacky
    });

    quizInput.on("propertychange input", function (event) {
        searchResults.children().each(function() {
            if ($(this).text().toLowerCase().includes(quizInput.val().toLowerCase())) $(this).show();
            else $(this).hide();
        });
    });

    quizInput.keydown(function (event) {
        if (event.which === 38) { // up arrow
            event.preventDefault();
            let visibles = searchResults.find(':visible').get();
            let i = visibles.findIndex(x => $(x).text() === $("#selectedItem").text());
            $("#selectedItem").removeAttr('id');
            $(visibles[i - 1]).attr('id', "selectedItem");
            quizInput.val($("#selectedItem").text());
            return;
        }
        if (event.which === 40) { // down arrow
            event.preventDefault();
            let visibles = searchResults.find(':visible').get();
            let i = visibles.findIndex(x => $(x).text() === $("#selectedItem").text());
            $("#selectedItem").removeAttr('id');
            $(visibles[i + 1]).attr('id', "selectedItem");
            quizInput.val($("#selectedItem").text());
            return;
        }

        // 13 => enter key
        if (event.which !== 13 || quizInput.val() !== answer || quizInput.is('[readonly]')) return;
        event.preventDefault();

        quizInput.attr("readonly", true);
        dropdown.hide();
        searchResults.children().each(function() {$(this).show();});
        $("#selectedItem").removeAttr('id');
        pics.forEach((x, i) => answerImg.append(
            $(`<img src="/public/images/${x.replace("%", "%25")}.png" class="revealImg${pics.length}" id="img${i}">`)));
        answerImg.append("<br>");
        quizAudio.trigger("play");
        setTimeout(getOneCry, 4000, ++index);
    });

    $(".listItem").each(function () {
        $(this).mouseover(function (event) {
            $("#selectedItem").removeAttr('id');
            $(this).attr('id', "selectedItem");
            $("#selectedItem").click(function (event) {
                quizInput.val($(this).text());
                quizInput.focus();
            });
        });
    });

    $(document).keydown(function (event) {
        // 32 => spacebar
        if (event.which === 32 && event.ctrlKey) return quizAudio.trigger("play");
        if (event.which < 48 || event.which > 90 || event.ctrlKey) return;

        quizInput.focus();
    })
})(window.jQuery);
