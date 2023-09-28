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
    var sizes = POKEMON.map(gen => gen.flat(1).filter(x => x !== "" && !x.includes(SKIPCHAR)).length);
    var old_sizes = [151, 100, 135, 108, 161];
    var simple_sizes = POKEMON.map(gen => gen.length);
    var indices;
    var cryIndex = currStreak = longestStreak = skipsUsed = totalRight = 0;
    var answers, allAnswers;
    var answer, id, pics;
    var canSkip = true;
    var logging = [];

    function findId(mon, pkmnList) {
        // if the pokemon has multiple forms with the same cry
        if (Array.isArray(mon)) {
            for (let [i, monScan] of pkmnList.entries())
                if (Array.isArray(monScan))
                    for (let [c, cry] of monScan.entries())
                        if (mon.every((form, formIdx) => form === cry[formIdx])) {
                            // if there is no definitive first form for this cry (so far just Cramorant)
                            if (pkmnList[i][0] === mon[0].substring(0, mon[0].indexOf(DELIMITER)))
                                return [`${cry[0].substring(0, cry[0].indexOf(DELIMITER))} (${
                                                            cry.slice(1).reduce((str, cur) => `${str} / ${cur.substring(cur.indexOf(DELIMITER) + 1)}`,
                                                                                                cry[0].substring(cry[0].indexOf(DELIMITER) + 1))
                                                        })`,
                                        `${("000" + (i + 1)).slice(-4)}${mon[0].substring(mon[0].indexOf(DELIMITER)).toLowerCase()}`];
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
        for (let [i, cry] of pkmnList.entries()) {
            if (cry === mon)
                return [mon, `${("000" + (i + 1)).slice(-4)}`]
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

    function getAnswers(list, language) {
        let openParen = " (", closeParen = ")", slash = " / ";
        if (["langJP", "langZH_T", "langZH_S"].includes(language)) {
            openParen = "（"; closeParen = "）";
        } else if (["langKR"].includes(language)) {
            openParen = "(";
        } if (["langJP", "langKR"].includes(language)) slash = "・";
        else if (["langZH_T", "langZH_S"].includes(language)) slash = "／";

        return list.map(
                (x, i) => typeof x === "string"
                        ? (!x.includes(DELIMITER) ? x : `${x.replace(DELIMITER, openParen)}${closeParen}`)
                        : (!x[0].includes(DELIMITER)
                            ? (x.every((v) => typeof v === "string")
                                ? x[0]
                                // this is designed to handle only Finizen atm, could break later
                                // (["Finizen", ["964_Palafin_Zero", "..."]] or ["Finizen", ["964_Palafin_Zero"], ["..."]])???
                                // currently handles the second but maybe first is more robust
                                // will leave it until i have reason to fix
                                : x.map((v) => typeof v === "string"
                                        ? v
                                        : `${v[0].substring(v[0].indexOf(DELIMITER) + 1).replace(DELIMITER, openParen)}${closeParen}`).join(slash))
                            : list.includes(x[0].substring(0, x[0].indexOf(DELIMITER)))
                                ? `${x[0].substring(0, x[0].indexOf(DELIMITER))}${openParen}${
                                                x.slice(1).reduce((str, cur) => 
                                                            `${str}${slash}${cur.substring(cur.indexOf(DELIMITER) + 1)}`,
                                                                        x[0].substring(x[0].indexOf(DELIMITER) + 1))}${closeParen}`
                                : x[0].substring(0, x[0].indexOf(DELIMITER))));
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
        let isExpanded = $("#toggleSimpleInput").is(":checked");
        let isUnbound = $("#toggleUnboundInput").is(":checked")
        let cryIdx = isUnbound ? Math.floor(Math.random() * indices.length) : i;
        let pkmnListEN = (isModern ? POKEMON_EN : OLD_POKEMON).flat(1).filter(x => x !== "");
        pkmnListEN = isExpanded
                        ? pkmnListEN.map(x => typeof x === "string" ? x : x.filter(x => !x.includes(SKIPCHAR)))
                        : pkmnListEN.map(x => typeof x === "string" ? x 
                                                : typeof x[0] === "string" ? [x[0]]: x.filter((e, i) => i === 0 || Array.isArray(e)));
        canSkip = true;
        if (!isUnbound && i >= indices.length) return; // maybe put a victory screen here idk
        quizInput.attr("readonly", false);
        answerImg.empty();
        quizInput.val('');
        let monEN = pkmnListEN.flat(1)[indices[cryIdx]];
        [answer, id] = findId(monEN, pkmnListEN);
        answer = allAnswers.find((mon) => mon.nameEN === answer).name;
        if (!isExpanded) answer = answer.split(/ \(| \/ /)[0];
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
        if (!isExpanded) pics = [pics[0]];
        quizAudio.attr("src", `/public/cries/${id.replace("%", "%25")}.mp3`);
        quizAudio.trigger("play");
        quizInput.select();
    }

    // get the current size of each gen
    function getSizes() {
        let cur_sizes = $("#toggleRetroInput").is(":checked") ? sizes : old_sizes;
        return $("#toggleSimpleInput").is(":checked") ? cur_sizes : simple_sizes.slice(0, cur_sizes.length);
    }

    // wait for the user to press enter, then get one cry
    async function awaitEnter() {
        $("#awaitEnter").show();
        await new Promise((resolve) => {
            document.addEventListener('keydown', waitForEnter);
            // TODO: clicking a button causes a DOMException. i have no clue why but it seems to have minimal impact so leave it
            $(".genList").each((i, e) => $(e).on('click', onClick));
            $(".toggleInput").each((i, e) => $(e).on('click', onClick));
            function waitForEnter(e) {
                // 13 => enter key
                if  (e.keyCode === 13) {
                    document.removeEventListener('keydown', waitForEnter);
                    resolve();
                }
            }
            function onClick(e) {
                $(".genList").each((i, e) => $(e).off('click', onClick));
                $(".toggleInput").each((i, e) => $(e).off('click', onClick));
                resolve();
            }
        });
        $("#awaitEnter").hide();
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
        timeout = $("#toggleSlowInput").is(":checked")
                    ? setTimeout(getOneCry, 4000, cryIndex)
                    : setTimeout(awaitEnter, quizAudio[0].duration * 1000);
    }

    function resetStats() {
        cryIndex = currStreak = longestStreak = skipsUsed = totalRight = 0;
        $("#completed").text(`Completed: ${cryIndex}/${indices.length}`);
        if ($("#toggleUnboundInput").is(":checked"))
            return $("#curStreak").text(`Current Streak: 0`);
        $("#curStreak").text(`Current streak: ${currStreak}`);
        $("#maxStreak").text(`Longest streak: ${longestStreak}`);
        $("#skipsUsed").text(`Skips used: ${skipsUsed}`);
        $("#precision").text(`Accuracy: -%`);
        logging = [];
    }

    answers = getAnswers(pkmn, "langEN");
    let old_answers = getAnswers(OLD_POKEMON.flat(2), "langEN");
    let cryIdx = -1;
    allAnswers = answers.map((mon, idx) => ({name: mon.includes(SKIPCHAR) ? mon.replace(SKIPCHAR, "").split(" (")[0] : mon,
                                            nameEN: mon,
                                            cryIdx: mon.includes(SKIPCHAR) ? cryIdx : ++cryIdx,
                                            retro: old_answers.includes(mon),
                                            simple: mon.includes(SKIPCHAR)
                                                    ? 1 + POKEMON.flat(1).findIndex(x => typeof x[0] === "string"
                                                                                            // TODO: scuffed???
                                                                                            ? x[0].split(DELIMITER)[0].includes(mon.split(" (")[0])
                                                                                            : false)
                                                    : mon.includes(" (")
                                                        // TODO: futureproof?
                                                        ? answers.find(x => x.includes(mon.split(" (")[0])) === mon
                                                        : true,
                            }))
                            .sort((a, b) => a.name.localeCompare(b.name));
    for (let x of allAnswers) searchResults.append(`<li class="listItem${
                                                        x.retro ? "" : " retroItem"}${
                                                        x.simple === true ? "" : " simpleItem"}${typeof x.simple === "boolean" ? "" : " suppressedSimple"
                                                    }">${x.name}</li>`);
    answers = allAnswers.filter((mon) => mon.retro || $("#toggleRetroInput").is(":checked"))
                        .filter((mon) => $("#toggleSimpleInput").is(":checked") ? typeof mon.simple === "boolean" : mon.simple)
                        .map((mon) => mon.name);
    
    $(".listItem").each(function () {
        $(this).on("mouseover", function (event) {
            event.preventDefault();
            $("#selectedItem").removeAttr('id');
            $(this).attr('id', "selectedItem").on("click", function (event) {
                event.preventDefault();
                quizInput.val($(this).text());
                quizInput.focus();
            });
        });
    });
    
    indices = [...Array(getSizes().reduce((a, b) => a + b, 0)).keys()];
    
    if ($("#toggleUnboundInput").is(":checked")) {
        $("#completed").hide();
        $("#maxStreak").hide();
        $("#skipsUsed").hide();
        $("#precision").hide();
    } else shuffle(indices);
    if (!$("#toggleRetroInput").is(":checked")) {
        $(".retroItem").toggleClass("suppressedRetro");
        $("#genList").children().slice(5).each(function() {$(this).hide();});
        $("#genList").children().slice(0, 5).each(function() {
            $(this).css("background", $(this).css("background").replace(/\/modern\/0/g, "/old/").replace(/png/g, "gif"));
        });
    }
    if (!$("#toggleSimpleInput").is(":checked")) {
        $(".simpleItem").toggleClass("suppressedSimple");
        answers = allAnswers.filter((mon) => mon.simple).map((mon) => mon.name.split(/ \(| \/ /)[0]); // grab before " (" or " / "
        searchResults.children().each((i, e) => $(e).text($(e).text().split(/ \(| \/ /)[0]));
    }
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

        $("#completed").text(`Completed: ${++cryIndex}/${indices.length}`);
        revealAnswer();
        if (isHardcore && quizInput.val() !== answer) {
            currStreak = -1; // will be incremented to 0 on display
            let len = quizInput.val().length;
            logging.push(`${quizInput.val()}${" ".repeat(len <= 24 ? 24 - len : len % 8 === 0 ? 0 : 8 - len % 8)}=> ${answer}`);
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
        } else ++totalRight;
        $("#curStreak").text(`Current streak: ${++currStreak}`);
        if (currStreak > longestStreak)
            $("#maxStreak").text(`Longest streak: ${longestStreak = currStreak}`);
        $("#precision").text(`Accuracy: ${(100 * totalRight / cryIndex).toFixed(2)}%`);
    });

    genList.children().each(function (index, element) {
        $(element).on("click", function (event) {
            event.preventDefault();
            $(element).toggleClass("unselectedGen");
            let s = getSizes();
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
        indices = shuffle([...Array(getSizes().reduce((a, b) => a + b, 0)).keys()]);
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

        logging.push(`SKIPPED                 => ${answer}`);
        quizInput.val(answer);
        $("#completed").text(`Completed: ${++cryIndex}/${indices.length}`);
        revealAnswer();
        $("#curStreak").text(`Current streak: ${currStreak = 0}`);
        $("#skipsUsed").text(`Skips used: ${++skipsUsed}`);
        $("#precision").text(`Accuracy: ${(100 * totalRight / cryIndex).toFixed(2)}%`);
    });

    $("#resultsButton").on("click", function (event) {
        event.preventDefault();
        let text = logging.join("\n");
        // TODO: replace this with a download
        console.log(text);
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
            let mapToFirstFormInNewLang = function (formerLang, newLang, a) {
                let thingy = formerLang[newLang.map((x) => Array.isArray(x) ? x[0] : x).indexOf(Array.isArray(a) ? a[0] : a)];
                return Array.isArray(thingy) ? thingy[0]
                        : thingy.includes(SKIPCHAR) ? thingy.replace(SKIPCHAR, "").split(DELIMITER)[0] : thingy;
            };
            answers = getAnswers(pkmn.toSorted((a, b) => mapToFirstFormInNewLang(formerLang, pkmn, a).localeCompare(
                                                        mapToFirstFormInNewLang(formerLang, pkmn, b)))
                                , $(langBtn).attr("id"));
            if (!$("#toggleSimpleInput").is(":checked")) answers = answers.map(x => x.split(/ \(|\(|（| \/ |・/)[0]);

            allAnswers.forEach((mon, idx) => mon.name = answers[idx].includes(SKIPCHAR)
                                                        ? answers[idx].replace(SKIPCHAR, "").split(/ \(|\(|（/)[0]
                                                        : answers[idx]);
            allAnswers.sort((a, b) => a.name.localeCompare(b.name));
            // perform a text replacement on all search results and sort
            searchResults.children().each((i, e) => $(e).text(answers[i].replace(SKIPCHAR, "")))
                                    .sort((a, b) => $(a).text().localeCompare($(b).text()))
                                    .detach().appendTo(searchResults);

            answers = allAnswers.filter(x => ($("#toggleRetroInput").is(":checked") ? true : x.retro) && 
                                            ($("#toggleSimpleInput").is(":checked") ? typeof x.simple === "boolean" : x.simple))
                                .map(x => x.name);
            clearTimeout(timeout);
            getOneCry(cryIndex);
        });
    });

    $("#toggleUnboundInput").on("click", function (event) {
        if (!$(this).is(":checked")) shuffle(indices);
        $("#completed").toggle();
        $("#maxStreak").toggle();
        $("#skipsUsed").toggle();
        $("#precision").toggle();
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $("#toggleRetroInput").on("click", function (event) {
        if ($(this).is(":checked")) {
            // entering modern mode
            $("#genList").children().slice(5).each(function() {$(this).show();});
            $("#genList").children().slice(0, 5).each(function() {
                $(this).css("background", $(this).css("background").replace(/\/old\//g, "/modern/0").replace(/gif/g, "png"));
            });
        } else {
            // entering retro mode
            $("#genList").children().slice(5).each(function() {$(this).hide();});
            $("#genList").children().slice(0, 5).each(function() {
                $(this).css("background", $(this).css("background").replace(/\/modern\/0/g, "/old/").replace(/png/g, "gif"));
            });
        }
        let cur_sizes = getSizes();
        indices = shuffle(genList.children().toArray().reduce(
            ([idxs, start], child, i) => !$(child).attr("class").includes("unselectedGen") && $(child).is(":visible")
                                        ? [idxs.concat([...Array(cur_sizes[i]).keys()].map(x => x + start)),
                                            start + cur_sizes[i]]
                                        : [idxs, start + cur_sizes[i]],
            [[], 0])[0]);
        answers = allAnswers.filter((mon) => mon.retro || $(this).is(":checked")).map((mon) => mon.name);
        $(".retroItem").toggleClass("suppressedRetro");
        resetStats();
        clearTimeout(timeout);
        getOneCry(cryIndex);
    });

    $("#toggleSimpleInput").on("click", function (event) {
        if ($(this).is(":checked")) {
            // entering expanded mode
            answers = allAnswers.filter((mon) => typeof mon.simple === "boolean").map((mon) => mon.name);
            searchResults.children().each((i, e) => $(e).text(allAnswers[i].name));
        } else {
            // entering simple mode
            answers = allAnswers.filter((mon) => mon.simple).map((mon) => mon.name.split(/ \(| \/ /)[0]); // grab before " (" or " / "
            searchResults.children().each((i, e) => $(e).text($(e).text().split(/ \(| \/ /)[0]));
        }
        let cur_sizes = getSizes();
        indices = shuffle(genList.children().toArray().reduce(
            ([idxs, start], child, i) => !$(child).attr("class").includes("unselectedGen") && $(child).is(":visible")
                                        ? [idxs.concat([...Array(cur_sizes[i]).keys()].map(x => x + start)),
                                            start + cur_sizes[i]]
                                        : [idxs, start + cur_sizes[i]],
            [[], 0])[0]);
        $(".simpleItem").toggleClass("suppressedSimple");
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
