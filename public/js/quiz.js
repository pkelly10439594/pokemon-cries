(function ($) {
    var dropdown = $("#dropdown");
    var quizInput = $("#quizInput");
    var quizAudio = $("#quizAudio");
    var answerImg = $("#answerImg");
    var searchResults = $("#searchResults");
    var genList = $("#genList");
    var timeout; // timeout for correct guess
    var POKEMON = POKEMON_EN;
    var pkmn = POKEMON.flat(2).filter(x => x !== ""); // filter out pokédex gaps
    const OLD_POKEMON = POKEMON.slice(0, 5).map(
        gen => gen.map(
            function (species) {
                if (Array.isArray(species))
                    species = species.filter(cry => !cry.includes(DELIMITER) || OLD_CRIES.includes(cry));
                species = typeof species === "string"
                        ? species
                        : typeof species[0] === "string"
                            ? species
                            : species.map(function(mon) {
                                if (Array.isArray(mon))
                                   mon = mon.filter(form => !form.includes(DELIMITER) || OLD_FORMS.includes(form));
                                return mon.length === 1 ? mon[0] : mon;
                            });
                return typeof species === "string"
                        ? species
                        : species.length === 1
                            ? typeof species[0] === "string"
                                ? species[0]
                                : species[0].length === 1 ? species[0][0] : species
                            : species;
            }
        )
    );
    const SIMPLE_POKEMON = POKEMON.map(
        gen => gen.map(
            species => typeof species === "string"
                    ? species
                    : typeof species[0] === "string"
                        ? species[0].split(DELIMITER)[0]
                        : species[0][0].split(DELIMITER)[0]
        )
    );
    var sizes = POKEMON.map(gen => gen.flat(1).filter(x => x !== "").length);
    var old_sizes = [151, 100, 135, 108, 161];
    var simple_sizes = POKEMON.map(gen => gen.length);
    var indices;
    var cryIndex = currStreak = longestStreak = skipsUsed = 0;
    var answers;
    var answer, id, pics;
    var canSkip = true;

    function findId(mon, pkmnList) {
        // if the pokemon has multiple forms with the same cry
        if (Array.isArray(mon)) {
            for (let [i, cry] of pkmnList.flat(1).entries())
                if (Array.isArray(cry))
                    for (let j of cry)
                        if (j[0].includes(mon[0])) {
                            // check for exactly cramorant's situation i think
                            if (pkmnList.flat(1)[i][0] === mon[0].substring(0, mon[0].indexOf(DELIMITER)))
                                return [`${j[0].substring(0, j[0].indexOf(DELIMITER))} (${j[0].substring(j[0].indexOf(DELIMITER) + 1)})`,
                                        `${("000" + (i + 1)).slice(-4)}${j[0].substring(j[0].indexOf(DELIMITER)).toLowerCase()}`];
                            else
                                return [j.every(v => typeof v === "string")
                                        ? j[0].includes(DELIMITER)
                                            ? j[0].substring(0, j[0].indexOf(DELIMITER))
                                            : j[0]
                                        // this is designed to handle only Finizen atm, could break later
                                        : j.map(v => typeof v === "string"
                                                ? v
                                                : `${v[0].substring(v[0].indexOf(DELIMITER) + 1).replace(DELIMITER, " (")})`).join(" / "),
                                        `${("000" + (i + 1)).slice(-4)}`];
                        }
        }
        // if the pokemon cry is a unique form of a pokemon
        for (let [i, cry] of pkmnList.flat(1).entries()) {
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

    function getAnswers(list) {
        return list.map(
            (x, i) => typeof x === "string"
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
        let isModern = $("#toggleRetroInput").is(":checked");
        let pkmnList = isModern ? POKEMON : OLD_POKEMON;
        canSkip = true;
        if (i >= indices.length) return; // maybe put a victory screen here idk
        quizInput.attr("readonly", false);
        answerImg.empty();
        quizInput.val('');
        let mon = pkmnList.flat(2)[indices[i]];
        [answer, id] = findId(mon, pkmnList);
        id = isModern ? `modern/${id}` : `old/${id.slice(1)}`;
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
        console.log(answer);
        console.log(id);
        console.log(pics);
        quizAudio.attr("src", `/public/cries/${id.replace("%", "%25")}.mp3`);
        quizAudio.trigger("play");
        quizInput.select();
    }

    // wait for the user to press enter, then get one cry
    async function awaitEnter() {
        await new Promise((resolve) => {
            document.addEventListener('keydown', waitForEnter);
            function waitForEnter(e) {
                // 13 => enter key
                if  (e.keyCode === 13) {
                    document.removeEventListener('keydown', waitForEnter);
                    resolve();
                }
            }
        });
        getOneCry(cryIndex);
    }

    // do this when the user is correct or gives up
    function revealAnswer() {
        let isModern = $("#toggleRetroInput").is(":checked");
        quizInput.attr("readonly", true);
        canSkip = false;
        dropdown.hide();
        searchResults.children().each(function() {$(this).show();});
        $("#selectedItem").removeAttr('id');
        pics.forEach((x, i) => answerImg.append(
            $(`<img src="/public/images/${x.replace("%", "%25")}.${isModern ? "png" : "gif"}"
            class="revealImg${pics.length}${isModern ? "" : " retro"}" id="img${i}">`)));
        answerImg.append("<br>");
        quizAudio.trigger("play");
    }

    function resetStats() {
        cryIndex = currStreak = longestStreak = skipsUsed = 0;
        $("#completed").text(`Completed: ${cryIndex}/${indices.length}`);
        $("#curStreak").text(`Current streak: ${currStreak}`);
        $("#maxStreak").text(`Longest streak: ${longestStreak}`);
        $("#skipsUsed").text(`Skips used: ${skipsUsed}`);
    }

    function populateDropdown() {
        searchResults.empty();
        for (let x of answers) searchResults.append(`<li class="listItem">${x}</li>`);
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
    }

    if ($("#toggleRetroInput").is(":checked")) {
        indices = [...pkmn.keys()];
        answers = getAnswers(pkmn);
    } else {
        indices = [...OLD_POKEMON.flat(2).keys()];
        answers = getAnswers(OLD_POKEMON.flat(2));
        $("#genList").children().slice(5).each(function() {$(this).hide();});
        $("#genList").children().slice(0, 5).each(function() {
            $(this).css("background", $(this).css("background").replace(/\/modern\/0/g, "/old/").replace(/png/g, "gif"));
        });
    }
    shuffle(indices);
    getOneCry(cryIndex);
    populateDropdown();
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
            let v = visibles.length;

            let i = visibles.findIndex(x => $(x).text() === $("#selectedItem").text());
            $("#selectedItem").removeAttr('id');
            // up arrow => i - 1; down arrow => i + 1
            // ((a % b) + b) % b => mod(a, b) (works with negatives, lone % does not)
            $(visibles[(((i + event.which - 39) % v) + v) % v]).attr('id', "selectedItem");

            quizInput.val($("#selectedItem").text());
            return;
        }

        isHardcore = $("#toggleHardcoreInput").is(":checked");
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
        if ($("#toggleSlowInput").is(":checked"))
            timeout = setTimeout(getOneCry, 4000, cryIndex);
        else
            timeout = setTimeout(awaitEnter, quizAudio[0].duration * 1000); // wait until the cry finishes
    });

    genList.children().each(function (index, element) {
        $(element).click(function (event) {
            event.preventDefault();
            $(element).toggleClass("unselectedGen");
            let s = $("#toggleRetroInput").is(":checked") ? sizes : old_sizes;
            let start = s.slice(0, index).reduce((a, b) => a + b, 0);
            indices = shuffle($(element).attr("class").includes("unselectedGen")
                                ? indices.filter((x, i) => x < start || x >= start + s[index])
                                : indices.concat([...Array(s[index]).keys()].map(x => x + start)));
            resetStats();
            clearTimeout(timeout);
            getOneCry(cryIndex);
        });
    });

    $("#showAll").click(function (event) {
        event.preventDefault();
        genList.children().removeClass("unselectedGen");
        indices = shuffle([...($("#toggleRetroInput").is(":checked") ? pkmn : OLD_POKEMON.flat(2)).keys()]);
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

    $("#toggleRetroInput").click(function (event) {
        if ($(this).is(":checked")) {
            // entering modern mode

            // show all gens after the first 5
            $("#genList").children().slice(5).each(function() {$(this).show();});
            $("#genList").children().slice(0, 5).each(function() {
                $(this).css("background", $(this).css("background").replace(/\/old\//g, "/modern/0").replace(/gif/g, "png"));
            });
            indices = shuffle(genList.children().toArray().reduce(
                ([idxs, start], child, i) => !$(child).attr("class").includes("unselectedGen")
                                            ? [idxs.concat([...Array(sizes[i]).keys()].map(x => x + start)),
                                                start + sizes[i]]
                                            : [idxs, start + sizes[i]],
                [[], 0])[0]);
            answers = getAnswers(pkmn);
        } else {
            // entering retro mode

            // hide all gens after the first 5
            $("#genList").children().slice(5).each(function() {$(this).hide();});
            $("#genList").children().slice(0, 5).each(function() {
                $(this).css("background", $(this).css("background").replace(/\/modern\/0/g, "/old/").replace(/png/g, "gif"));
            });
            indices = shuffle(genList.children().toArray().reduce(
                ([idxs, start], child, i) => !$(child).attr("class").includes("unselectedGen") && $(child).is(":visible")
                                            ? [idxs.concat([...Array(old_sizes[i]).keys()].map(x => x + start)),
                                                start + old_sizes[i]]
                                            : [idxs, start + old_sizes[i]],
                [[], 0])[0]);
            answers = getAnswers(OLD_POKEMON.flat(2));
        }
        populateDropdown();
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $("#toggleSimpleInput").click(function (event) {
        let cur_sizes = $(this).is(":checked") ? sizes : simple_sizes;
        indices = shuffle(genList.children().toArray().reduce(
            ([idxs, start], child, i) => !$(child).attr("class").includes("unselectedGen") && $(child).is(":visible")
                                        ? [idxs.concat([...Array(cur_sizes[i]).keys()].map(x => x + start)),
                                            start + cur_sizes[i]]
                                        : [idxs, start + cur_sizes[i]],
            [[], 0])[0]);
        populateDropdown();
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $(document).keydown(function (event) {
        // 32 => spacebar
        if (event.which === 32 && event.ctrlKey) return quizAudio.trigger("play");
        if (event.which < 48 || event.which > 90 || event.ctrlKey) return;

        quizInput.focus();
    })
})(window.jQuery);
