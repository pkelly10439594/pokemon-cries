(function ($) {
    var genIndex = -1;
    var genIndicator = $("#genIndicator");
    var genList = $("#genList");
    var pkmnIndex = 0;
    var pkmnList = $("#pkmnList");

    function getPkmnCryHTML(pkmnNames, extensions, fileNames, cryTag, gen) {
        return $(`
            <div class="cryButton gen${gen + 1}" id="${cryTag}">
                ${pkmnNames.reduce((a, b, i) => a + `
                    <img src="/public/images/${fileNames[i]}${extensions[i].replace("%", "%25")}.png" class="cryImg">
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
            new Audio(`/public/cries/${$(this).attr("id").replace("%", "%25")}.mp3`).play();
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
})(window.jQuery);
