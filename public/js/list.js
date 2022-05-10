(function($) {
    var genList = $("#genList");
    var genIndicator = $("#genIndicator");
    var generation = -1;
    var genIndex = -1;
    var pkmnList = $("#pkmnList");

    function getPkmnCryHTML(pkmnNames, extensions, fileName, cryTag, gen) {
        return $(`
            <div class="cryButton gen${gen}" id="${cryTag}">
                ${pkmnNames.reduce((a, b, i) => a + `
                    <img src="/public/images/${fileName}${extensions[i].replace("%", "%25")}.png" class="cryImg">
                    ${b.replace(DELIMITER, "-")}
                `, "")}
                <audio>
                    <source src="/public/cries/${cryTag.replace("%", "%25")}.mp3" type="audio/mpeg">
                </audio>
            </div>
        `);
    }

//  STILL USEFUL FOR GENERATING THE PAGES, MIGHT REVERT TO THIS LATER
    genList.children().each(function (index, element) {
        $(element).on("click", function (event) {
            event.preventDefault();
            if (index + 1 === generation) return;
            generation = index + 1;
            switch (generation) {
                case 1: genIndex = 1;break;
                case 2: genIndex = 152;break;
                case 3: genIndex = 252;break;
                case 4: genIndex = 387;break;
                case 5: genIndex = 494;break;
                case 6: genIndex = 650;break;
                case 7: genIndex = 722;break;
                case 8: genIndex = 810;break;
                default: genIndex = -1;
            }
            genIndicator.text(`Generation ${generation}`);
            let pkmnSubList = POKEMON[index];

            // Display all the pokemon to the screen
            pkmnList.empty();
            pkmnSubList.forEach((species, i) => {
                indAsStr = ("000" + (i+genIndex)).slice(-4);
                if (typeof(species) === 'string') // element only has one cry
                    pkmnList.append(getPkmnCryHTML([species], [""], indAsStr, indAsStr, generation));
                else // element is a species with multiple cries
                    species.forEach((cry) => {
                        if (typeof(cry) === 'string') { // this cry only has one form
                            let ending = cry.includes(DELIMITER)
                                ? cry.slice(cry.indexOf(DELIMITER)).toLowerCase()
                                : "";
                            pkmnList.append(getPkmnCryHTML([cry], [ending], indAsStr, indAsStr + ending, generation));
                        } else { // this cry has multiple forms
                            if (typeof(species[0]) === 'string') // this pokemon has a definite main form
                                pkmnList.append(getPkmnCryHTML(cry,
                                                    cry.map((form) => {
                                                        return form.includes(DELIMITER)
                                                            ? form.slice(form.indexOf(DELIMITER)).toLowerCase()
                                                            : "";}),
                                                    indAsStr, indAsStr + cry[0].slice(cry[0].indexOf(DELIMITER)).toLowerCase(),
                                                    generation));
                            else // this pokemon has multiple initial forms
                                pkmnList.append(getPkmnCryHTML(cry,
                                                    cry.map((form) => {
                                                        return form.includes(DELIMITER)
                                                            ? form.slice(form.indexOf(DELIMITER)).toLowerCase()
                                                            : "";}),
                                                    indAsStr, indAsStr, generation));
                        }
                    });
            });
            for (let box of pkmnList.children())
                box.addEventListener("click", function() {$(this).children("audio")[0].play()});
        });
    });
})(window.jQuery);
