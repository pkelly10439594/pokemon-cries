(function ($) {
    var dropdown = $("#dropdown");
    var quizInput = $("#quizInput");
    var quizAudio = $("#quizAudio");
    var answerImg = $("#answerImg");
    var searchResults = $("#searchResults");
    var genList = $("#genList");
    var timeout; // timeout for correct guess
    var pkmn = POKEMON.flat(2).filter(x => {return x !== "";}); // filter out pokédex gaps
    var sizes = POKEMON.map(gen => gen.flat(1).filter(x => {return x !== "";}).length);
    var indices = [...pkmn.keys()];
    var cryIndex = currStreak = longestStreak = skipsUsed = 0;
    var answer, id, pics;
    var canSkip = true;
    var isHardcore = $("#toggleHardcoreInput").is(":checked");
    var answers = POKEMON.flat(2).map((x, i) => typeof x === "string"
                                            ? (!x.includes(DELIMITER) ? x : `${x.replace(DELIMITER, " (")})`)
                                            : (!x[0].includes(DELIMITER)
                                                ? (x.every((v) => typeof v === "string")
                                                    ? x[0]
                                                    // this is designed to handle only Finizen atm, could break later
                                                    // (["Finizen", ["964_Palafin_Zero", "..."]] or ["Finizen", ["964_Palafin_Zero"], ["..."]])???
                                                    // currently handles the second but maybe first is more robust
                                                    // will leave it until i have reason to fix
                                                    : x.map((v) => typeof v === "string"
                                                            ? v
                                                            : `${v[0].substring(v[0].indexOf(DELIMITER) + 1).replace(DELIMITER, " (")})`).join(" / "))
                                                : x[0].includes(POKEMON.flat(2)[i - 1])
                                                ? `${x[0].replace(DELIMITER, " (")})`
                                                : x[0].substring(0, x[0].indexOf(DELIMITER))))
                                        .sort();

    function findId(mon) {
        // if the pokemon has multiple forms with the same cry
        if (Array.isArray(mon)) {
            for (let [i, cry] of POKEMON.flat(1).entries())
                if (Array.isArray(cry))
                    for (let j of cry)
                        if (j[0].indexOf(mon[0]) > -1) { //includes?
                            // check for exactly cramorant's situation i think
                            if (POKEMON.flat(1)[i][0] === mon[0].substring(0, mon[0].indexOf(DELIMITER)))
                                return [`${j[0].substring(0, j[0].indexOf(DELIMITER))} (${j[0].substring(j[0].indexOf(DELIMITER) + 1)})`,
                                        `${("000" + (i + 1)).slice(-4)}${j[0].substring(j[0].indexOf(DELIMITER)).toLowerCase()}`];
                            else
                                return [j.every((v) => typeof v === "string")
                                        ? j[0].includes(DELIMITER)
                                            ? j[0].substring(0, j[0].indexOf(DELIMITER))
                                            : j[0]
                                        // this is designed to handle only Finizen atm, could break later
                                        : j.map((v) => typeof v === "string"
                                                ? v
                                                : `${v[0].substring(v[0].indexOf(DELIMITER) + 1).replace(DELIMITER, " (")})`).join(" / "),
                                        `${("000" + (i + 1)).slice(-4)}`];
                        }
        }
        // if the pokemon cry is a unique form of a pokemon
        for (let [i, cry] of POKEMON.flat(1).entries()) {
            if (cry === mon)
                return [mon, `${("000" + (i + 1)).slice(-4)}`];
            else
                for (let j of cry)
                    if (j === mon)
                        return [!mon.includes(DELIMITER)
                                    ? mon
                                    : `${mon.substring(0, mon.indexOf(DELIMITER))} (${mon.substring(mon.indexOf(DELIMITER) + 1)})`,
                                `${("000" + (i + 1)).slice(-4)}${mon.includes(DELIMITER)
                                                                    ? mon.substring(mon.indexOf(DELIMITER)).toLowerCase()
                                                                    : ""}`];
        }
    }

    // shuffle the indices (Fisher-Yates algorithm)
    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function getOneCry(i) {
        canSkip = true;
        if (i >= indices.length) return; // maybe put a victory screen here idk
        quizInput.attr("readonly", false);
        answerImg.empty();
        quizInput.val('');
        let mon = pkmn[indices[i]];
        [answer, id] = findId(mon);
        pics = typeof mon === "string"
                    ? [id]
                    : mon.map(x => typeof x === "string"
                                ? !x.includes(DELIMITER)
                                    ? id
                                    : id.split(DELIMITER)[0] + x.substring(x.indexOf(DELIMITER)).toLowerCase()
                                // this is designed to handle only Finizen atm, could break later
                                : ("000" + x[0].slice(0, x[0].indexOf(DELIMITER))).slice(-4)
                                    + DELIMITER
                                    + x[0].split(DELIMITER).pop().toLowerCase());
        quizAudio.attr("src", `/public/cries/${id.replace("%", "%25")}.mp3`);
        quizAudio.trigger("play");
        quizInput.select();
    }

    // do this when the user is correct or gives up
    function revealAnswer() {
        quizInput.attr("readonly", true);
        canSkip = false;
        dropdown.hide();
        searchResults.children().each(function() {$(this).show();});
        $("#selectedItem").removeAttr('id');
        pics.forEach((x, i) => answerImg.append(
            $(`<img src="/public/images/${x.replace("%", "%25")}.png" class="revealImg${pics.length}" id="img${i}">`)));
        answerImg.append("<br>");
        quizAudio.trigger("play");
    }

    function resetStats() {
        cryIndex = currStreak = longestStreak = skipsUsed = 0;
        $("#completed").text(`Completed: ${cryIndex}/${indices.length}`);
        $("#curStreak").text(`Current Streak: ${currStreak}`);
        $("#maxStreak").text(`Longest Streak: ${longestStreak}`);
        $("#skipsUsed").text(`Skips Used: ${skipsUsed}`);
    }

    shuffle(indices);
    getOneCry(cryIndex);
    for (let x of answers) searchResults.append(`<li class="listItem">${x}</li>`);
    resetStats();

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
        if (event.which === 38 || event.which === 40) { // up arrow or down arrow
            event.preventDefault();
            let visibles = searchResults.find(':visible').get();
            let i = visibles.findIndex(x => $(x).text() === $("#selectedItem").text());
            $("#selectedItem").removeAttr('id');
            // up arrow => i - 1; down arrow => i + 1
            $(visibles[i + event.which - 39]).attr('id', "selectedItem");
            quizInput.val($("#selectedItem").text());
            return;
        }

        // 13 => enter key
        if (event.which !== 13 || quizInput.is('[readonly]')
            || (quizInput.val() !== answer && !isHardcore)
            || (isHardcore && !answers.includes(quizInput.val()))) return;
        event.preventDefault();

        revealAnswer();
        $("#completed").text(`Completed: ${++cryIndex}/${indices.length}`);
        if (isHardcore && quizInput.val() !== answer) {
            currStreak = -1; // will be incremented to 0 on display
            quizInput.val(answer);

            // flash the screen red
            bg = $("body").css("background-color");
            $("body").css({ "background-color": "red", "-webkit-transition": "none", "-moz-transition": "none",
                            "-ms-transition": "none", "-o-transition": "none", "transition": "none" });
            timeout = setTimeout(function () {$("body").css({
                                                "background-color": bg, "-webkit-transition": "background 0.5s linear",
                                                "-moz-transition": "background 0.5s linear", "-ms-transition": "background 0.5s linear",
                                                "-o-transition": "background 0.5s linear", "transition": "background 0.5s linear"
                                            });}, 1); // do this 1ms later
        }
        $("#curStreak").text(`Current streak: ${++currStreak}`);
        if (currStreak > longestStreak)
            $("#maxStreak").text(`Longest streak: ${longestStreak = currStreak}`);
        timeout = setTimeout(getOneCry, 4000, cryIndex);
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

    genList.children().each(function (index, element) {
        $(element).click(function (event) {
            event.preventDefault();
            $(element).toggleClass("unselectedGen");
            let start = sizes.slice(0, index).reduce((a, b) => a + b, 0);
            indices = shuffle($(element).attr("class").includes("unselectedGen")
                                ? indices.filter((x, i) => x < start || x >= start + sizes[index])
                                : indices.concat([...Array(sizes[index]).keys()].map(x => x + start)));
            resetStats();
            clearTimeout(timeout);
            getOneCry(cryIndex);
        });
    });

    $("#showAll").click(function (event) {
        event.preventDefault();
        genList.children().removeClass("unselectedGen");
        indices = shuffle([...pkmn.keys()]);
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $("#showNone").click(function (event) {
        event.preventDefault();
        genList.children().addClass("unselectedGen");
        indices = [];
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $("#skipButton").click(function (event) {
        if (!canSkip) return;
        event.preventDefault();

        quizInput.val(answer);
        revealAnswer();
        $("#completed").text(`Completed: ${++cryIndex}/${indices.length}`);
        $("#curStreak").text(`Current streak: ${currStreak = 0}`);
        $("#skipsUsed").text(`Skips used: ${++skipsUsed}`);
        timeout = setTimeout(getOneCry, 4000, cryIndex);
    });

    $("#toggleHardcoreSlider").click(function (event) {
        isHardcore = !isHardcore;
    });

    $(document).keydown(function (event) {
        // 32 => spacebar
        if (event.which === 32 && event.ctrlKey) return quizAudio.trigger("play");
        if (event.which < 48 || event.which > 90 || event.ctrlKey) return;

        quizInput.focus();
    })
})(window.jQuery);
