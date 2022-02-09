(function($) {
    var genList = $("#genList");
    var genIndicator = $("#genIndicator");
    var generation = -1;
    var genIndex = -1;
    var pkmnList = $("#pkmnList");

    function getPkmnCryHTML(pkmnNames, extensions, fileName) {
        return $(`
            <div class="cryButton">
                ${pkmnNames.reduce((a, b, i) => a + `
                    <img src="/public/images/${fileName}${extensions[i]}.png" class="cryImg">
                    ${b.replace(DELIMITER, "-")}
                `, "")}
                <!--<audio controls>
                    <source src="/public/cries/${fileName}.mp3" type="audio/mpeg">
                </audio>-->
            </div>
        `);
    }

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
                    pkmnList.append(getPkmnCryHTML([species], [""], indAsStr));
                else // element is a species with multiple cries
                    species.forEach((cry) => {
                        if (typeof(cry) === 'string') // this cry only has one form
                            pkmnList.append(getPkmnCryHTML([cry],
                                                [cry.includes(DELIMITER)
                                                    ? cry.slice(cry.indexOf(DELIMITER)).toLowerCase()
                                                    : ""],
                                                indAsStr));
                        else // this cry has multiple forms
                            pkmnList.append(getPkmnCryHTML(cry,
                                                cry.map((form) => {
                                                    return form.includes(DELIMITER)
                                                        ? form.slice(form.indexOf(DELIMITER)).toLowerCase()
                                                        : "";}),
                                                indAsStr));
                    });
            });
        });
    });
})(window.jQuery);
