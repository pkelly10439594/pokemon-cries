(function ($) {
    var genIndex = -1;
    var genIndicator = $("#genIndicator");
    var genList = $("#genList");
    var pkmnIndex = 0;
    var pkmnList = $("#pkmnList");
    var POKEMON = POKEMON_EN;

    function getPkmnCryHTML(pkmnNames, extensions, fileNames, cryTag, gen) {
        return $(`
            <div class="cryButton gen${gen + 1}" id="${cryTag}">
                ${pkmnNames.reduce((a, b, i) => a + `
                    <img src="/public/images/modern/mini/${fileNames[i]}${extensions[i].replace("%", "%25")}.png" class="cryImg">
                    ${b.indexOf(DELIMITER) === -1 ? b : b.replace(DELIMITER, " (").concat(")")}
                `, "")}
            </div>
        `);
    }

    pkmnList.hide();

    for (let [generation, pkmnSubList] of POKEMON.entries()) {
        for (let species of pkmnSubList) {
            ++pkmnIndex;
            if (species === "") continue; // in case there is a gap in the pokédex
            let indAsStr = ("000" + pkmnIndex).slice(-4);

            if (typeof(species) === 'string') // element only has one cry
                pkmnList.append(getPkmnCryHTML([species], [""], [indAsStr], indAsStr, generation));
            else if (pkmnIndex === 982) // dudunsparce is a special case because it has two forms but one minisprite
                pkmnList.append(getPkmnCryHTML(species[0][0].split(DELIMITER, 1), [""], [indAsStr], indAsStr, generation));
            else // element is a species with multiple cries
                species.forEach((cry) => {
                    if (typeof(cry) === 'string') { // this cry only has one form
                        let ending = cry.includes(DELIMITER)
                            ? cry.slice(cry.indexOf(DELIMITER)).toLowerCase()
                            : "";
                        pkmnList.append(getPkmnCryHTML([cry], [ending], [indAsStr], indAsStr + ending, generation));
                    } else { // this cry has multiple forms
                        if (typeof(species[0]) === 'string') // this pokemon has a definite main form
                            pkmnList.append(getPkmnCryHTML(cry,
                                                cry.map((form) => {
                                                    return form.includes(DELIMITER)
                                                        ? form.slice(form.indexOf(DELIMITER)).toLowerCase()
                                                        : "";}),
                                                Array(cry.length).fill(indAsStr),
                                                indAsStr + cry[0].slice(cry[0].indexOf(DELIMITER)).toLowerCase(),
                                                generation));
                        else // this pokemon has multiple initial forms
                            pkmnList.append(getPkmnCryHTML(
                                                cry.map((form) => {
                                                    // this is designed to handle only Finizen atm, could break later
                                                    // (["Finizen", ["964_Palafin_Zero", "..."]] or ["Finizen", ["964_Palafin_Zero"], ["..."]])???
                                                    // currently handles the second but maybe first is more robust
                                                    // will leave it until i have reason to fix
                                                    return typeof(form) === "string"
                                                        ? form
                                                        : form[0].slice(form[0].indexOf(DELIMITER) + 1);
                                                }),
                                                cry.map((form) => {
                                                    return typeof(form) === "string"
                                                        ? form.includes(DELIMITER)
                                                            ? form.slice(form.indexOf(DELIMITER)).toLowerCase()
                                                            : ""
                                                        : DELIMITER + form[0].split(DELIMITER).pop().toLowerCase();
                                                }),
                                                cry.map((form) => {
                                                    // this is designed to handle only Finizen atm, could break later
                                                    return typeof(form) === "string"
                                                        ? indAsStr
                                                        : ("000" + form[0].slice(0, form[0].indexOf(DELIMITER))).slice(-4);
                                                }),
                                                indAsStr, generation));
                    }
                });
        }
    }

    pkmnList.children().each(function (index, element) {
        $(element).hide();
        $(element).click(function(event) {
            event.preventDefault();
            new Audio(`/public/cries/modern/${$(this).attr("id").replace("%", "%25")}.mp3`).play();
        });
    });
    pkmnList.show();

    genList.children().each(function (index, element) {
        $(element).click(function (event) {
            event.preventDefault();
            $(`.gen${index + 1}`).each(function (i, e) {$(e).toggle();});
            $(element).toggleClass("unselectedGen");
        });
    });

    $("#showAll").click(function (event) {
        event.preventDefault();
        for (let g = 1; g <= POKEMON.length; g++)
            $(`.gen${g}`).each(function (i, e) {$(e).show()});
        genList.children().removeClass("unselectedGen");
    });

    $("#showNone").click(function (event) {
        event.preventDefault();
        for (let g = 1; g <= POKEMON.length; g++)
            $(`.gen${g}`).each(function (i, e) {$(e).hide()});
        genList.children().addClass("unselectedGen");
    });

    $("#langList").children().each(function (langIdx, langBtn) {
        $(langBtn).click(function (event) {
            event.preventDefault();
            switch ($(langBtn).attr("id")) {
                case "langJP": POKEMON = POKEMON_JP; break;
                case "langFR": POKEMON = POKEMON_FR; break;
                case "langES": POKEMON = POKEMON_ES; break;
                case "langDE": POKEMON = POKEMON_DE; break;
                case "langIT": POKEMON = POKEMON_IT; break;
                case "langKR": POKEMON = POKEMON_KR; break;
                case "langZH_T": POKEMON = POKEMON_ZH_T; break;
                case "langZH_S": POKEMON = POKEMON_ZH_S; break;
                case "langEN":
                // make the default be english in case the id is unexpected
                default: POKEMON = POKEMON_EN; break;
            }

            let pkmnFlat = POKEMON.flat(2);
            pkmnList.children().each(function (cryIndex, element) {
                if (typeof pkmnFlat[cryIndex] === 'string')
                    $(element).children()[0].nextSibling.nodeValue = pkmnFlat[cryIndex].includes(DELIMITER)
                                                                        ? pkmnFlat[cryIndex].replace(DELIMITER, " (").concat(")")
                                                                        : pkmnFlat[cryIndex];
                else if ($(element).children().length === 1) // some pokemon may have two forms but one minisprite
                    $(element).children()[0].nextSibling.nodeValue = pkmnFlat[cryIndex][0].split(DELIMITER)[0];
                else
                    $(element).children().each(function (formIndex, e) {
                        $(e)[0].nextSibling.nodeValue = typeof pkmnFlat[cryIndex][formIndex] === "string"
                                                        ? pkmnFlat[cryIndex][formIndex].includes(DELIMITER)
                                                            ? pkmnFlat[cryIndex][formIndex].replace(DELIMITER, " (").concat(")")
                                                            : pkmnFlat[cryIndex][formIndex]
                                                        : pkmnFlat[cryIndex][formIndex][0].split(DELIMITER).slice(-2).join(" (").concat(")");
                    });
            });
        });
    });
})(window.jQuery);
