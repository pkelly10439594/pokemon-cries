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
    var sizes = POKEMON.map(gen => gen.flat(1).filter(x => x !== "").length);
    var old_sizes = [151, 100, 135, 108, 161];
    var simple_sizes = POKEMON.map(gen => gen.length);
    var indices;
    var cryIndex = currStreak = longestStreak = skipsUsed = 0;
    var answers;
    var answer, id, pics;
    var canSkip = true;

    function findId(mon, pkmnList, monEN, pkmnListEN) {
        // if the pokemon has multiple forms with the same cry
        if (Array.isArray(mon)) {
            for (let [i, monScan] of pkmnList.flat(1).entries())
                if (Array.isArray(monScan))
                    for (let [c, cry] of monScan.entries())
                        if (mon.every((form, formIdx) => form === cry[formIdx])) {
                            // if there is no definitive first form (so far just Cramorant)
                            if (pkmnList.flat(1)[i][0] === mon[0].substring(0, mon[0].indexOf(DELIMITER)))
                                return [`${cry[0].substring(0, cry[0].indexOf(DELIMITER))} (${
                                                            cry.slice(1).reduce((str, cur) => `${str} / ${cur.substring(cur.indexOf(DELIMITER) + 1)}`,
                                                                                                cry[0].substring(cry[0].indexOf(DELIMITER) + 1))
                                                        })`,
                                        `${("000" + (i + 1)).slice(-4)}${monEN[0].substring(monEN[0].indexOf(DELIMITER)).toLowerCase()}`];
                            else
                                return [cry.every(v => typeof v === "string")
                                        ? cry[0].includes(DELIMITER)
                                            ? cry[0].substring(0, cry[0].indexOf(DELIMITER))
                                            : cry[0]
                                        // this is designed to handle only Finizen atm, could break later
                                        : cry.map(v => typeof v === "string"
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
                                                                    ? monEN.substring(monEN.indexOf(DELIMITER)).toLowerCase()
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
                        : list.includes(x[0].substring(0, x[0].indexOf(DELIMITER)))
                            ? `${x[0].substring(0, x[0].indexOf(DELIMITER))} (${x.slice(1).reduce((str, cur) => `${str} / ${cur.substring(cur.indexOf(DELIMITER) + 1)}`,
                                                                                                        x[0].substring(x[0].indexOf(DELIMITER) + 1))})`
                            : x[0].substring(0, x[0].indexOf(DELIMITER))))
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
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
        let pkmnListEN = isModern ? POKEMON_EN : OLD_POKEMON;
        canSkip = true;
        if (i >= indices.length) return; // maybe put a victory screen here idk
        quizInput.attr("readonly", false);
        answerImg.empty();
        quizInput.val('');
        let mon = pkmnList.flat(2)[indices[i]];
        let monEN = pkmnListEN.flat(2)[indices[i]];
        [answer, id] = findId(mon, pkmnList, monEN, pkmnListEN);
        id = isModern ? `modern/${id}` : `old/${id.slice(1)}`;
        pics = typeof monEN === "string"
                    ? [id]
                    : monEN.map(x => typeof x === "string"
                                ? !x.includes(DELIMITER)
                                    ? id
                                    : id.split(DELIMITER)[0] + x.substring(x.indexOf(DELIMITER)).toLowerCase()
                                // this is designed to handle only Finizen atm, could break later
                                : "modern/" + ("000" + x[0].slice(0, x[0].indexOf(DELIMITER))).slice(-4)
                                    + DELIMITER
                                    + x[0].split(DELIMITER).pop().toLowerCase());
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

    answers = getAnswers(pkmn);
    let old_answers = getAnswers(OLD_POKEMON.flat(2));
    for (let x of answers) searchResults.append(`<li class="listItem${old_answers.includes(x) ? "" : " retroItem"}">${x}</li>`);
    $(".listItem").each(function () {
        $(this).on("mouseover", function (event) {
            $("#selectedItem").removeAttr('id');
            $(this).attr('id', "selectedItem").on("click", function (event) {
                quizInput.val($(this).text());
                quizInput.focus();
            });
        });
    });
    
    if ($("#toggleRetroInput").is(":checked")) {
        indices = [...pkmn.keys()];
    } else {
        indices = [...OLD_POKEMON.flat(2).keys()];
        // TODO: remove items from `answers` if they are suppressed from retro mode (LOW PRIO)
        $(".retroItem").addClass("suppressedRetro");
        $("#genList").children().slice(5).each(function() {$(this).hide();});
        $("#genList").children().slice(0, 5).each(function() {
            $(this).css("background", $(this).css("background").replace(/\/modern\/0/g, "/old/").replace(/png/g, "gif"));
        });
    }
    shuffle(indices);
    getOneCry(cryIndex);
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
            // str.normalize("NFD").replace(/\p{Diacritic}/gu, "") removes accents from string str
            if ($(this).text().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(
                        quizInput.val().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")))
                $(this).show();
            else
                $(this).hide();
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
        $(element).on("click", function (event) {
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

    $("#showAll").on("click", function (event) {
        event.preventDefault();
        genList.children().removeClass("unselectedGen");
        indices = shuffle([...($("#toggleRetroInput").is(":checked") ? pkmn : OLD_POKEMON.flat(2)).keys()]);
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $("#showNone").on("click", function (event) {
        event.preventDefault();
        genList.children().addClass("unselectedGen");
        indices = [];
        resetStats();
        clearTimeout(timeout);
    });

    $("#skipButton").on("click", function (event) {
        if (!canSkip) return;
        event.preventDefault();

        quizInput.val(answer);
        revealAnswer();
        $("#completed").text(`Completed: ${++cryIndex}/${indices.length}`);
        $("#curStreak").text(`Current streak: ${currStreak = 0}`);
        $("#skipsUsed").text(`Skips used: ${++skipsUsed}`);
        timeout = setTimeout(getOneCry, 4000, cryIndex);
    });

    $("#langList").children().each(function (langIdx, langBtn) {
        $(langBtn).on("click", function (event) {
            event.preventDefault();
            // save the language before changing it to make sorting easier later
            let formerLang = POKEMON.flat(2);
            switch ($(langBtn).attr("id")) {
                case "langEN": POKEMON = POKEMON_EN; break;
                case "langJP": POKEMON = POKEMON_JP; break;
                case "langFR": POKEMON = POKEMON_FR; break;
                case "langES": POKEMON = POKEMON_ES; break;
                case "langDE": POKEMON = POKEMON_DE; break;
                case "langIT": POKEMON = POKEMON_IT; break;
                case "langKR": POKEMON = POKEMON_KR; break;
                case "langZH_T": POKEMON = POKEMON_ZH_T; break;
                case "langZH_S": POKEMON = POKEMON_ZH_S; break;
                default: throw new Error("Unexpected language selection.");
            }

            pkmn = POKEMON.flat(2).filter(x => x !== "");
            // translate the new set of answers
            answers = getAnswers(pkmn.toSorted((a, b) => formerLang[pkmn.indexOf(a)].toString().localeCompare(formerLang[pkmn.indexOf(b)])));
            // perform a text replacement on all search results
            searchResults.children().each((i, e) => $(e).text(answers[i]));
            // sort the final searchResults by innerHTML
            // TODO: BUG: sorting it doesnt move the retro class labels :(
            searchResults.children().sort((a, b) => $(a).text().localeCompare($(b).text()));
            searchResults.children().detach().appendTo(searchResults);
            console.log(searchResults.children());
            answers.sort();
            clearTimeout(timeout);
            getOneCry(cryIndex);
        });
    });

    $("#toggleRetroInput").on("click", function (event) {
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
        }
        $(".retroItem").toggleClass("suppressedRetro");
        resetStats();
        clearTimeout(timeout);
        // TODO: this doesnt translate the actual correct answer properly if in retro mode
        // IDEA: what if we never sort the answers variable and we instead permute it to match the indices
        //       THIS WONT WORK BECAUSE answers HAS TO MATCH THE DROPDOWN IN ORDER TO TRANSLATE
        //       maybe if after doing that we simply repermute to match the indices
        getOneCry(cryIndex);
    });

    // TODO: Implement. This slider is unfinished and may require a structural overhaul to complete.
    $("#toggleSimpleInput").on("click", function (event) {
        let cur_sizes = $(this).is(":checked") ? sizes : simple_sizes;
        indices = shuffle(genList.children().toArray().reduce(
            ([idxs, start], child, i) => !$(child).attr("class").includes("unselectedGen") && $(child).is(":visible")
                                        ? [idxs.concat([...Array(cur_sizes[i]).keys()].map(x => x + start)),
                                            start + cur_sizes[i]]
                                        : [idxs, start + cur_sizes[i]],
            [[], 0])[0]);
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $(document).keydown(function (event) {
        // 32 => spacebar
        if (event.which === 32 && event.ctrlKey) return quizAudio.trigger("play");
        if (event.which < 48 || event.which > 90 || event.ctrlKey) return;

        quizInput.focus();
    });
})(window.jQuery);
