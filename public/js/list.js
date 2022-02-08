(function($) {
    var genList = $("#genList");
    var genIndicator = $("#genIndicator");
    var generation = -1;
    var pkmnList = $("#pkmnList");

    function getPkmnCryHTML(pkmnNames, fileName) {
        if (typeof(pkmnNames) === 'string') // this cry has only one corresponding form
            pkmnNames = [pkmnNames];
        return $(`
            <div class="cryButton">
                ${pkmnNames.reduce((a, b) => a + `
                    <img src="/public/images/${fileName}.png" class="cryImg">
                    ${b.replace("|", "-")}
                `, "")}
                <audio controls>
                    <source src="/public/cries/${fileName}.mp3" type="audio/mpeg">
                </audio>
            </div>
        `);
    }

    genList.children().each(function (index, element) {
        $(element).on("click", function (event) {
            event.preventDefault();
            if (index + 1 === generation) return;
            generation = index + 1;
            genIndicator.text(`Generation ${generation}`);
            let pkmnSubList = pokemon[index];

            // Display all the pokemon to the screen
            pkmnList.empty();
            pkmnSubList.forEach((species, i) => {
                if (typeof(species) === 'string') // element only has one cry
                    pkmnList.append(getPkmnCryHTML(species, "737")); //change the 737 later
                else // element is a species with multiple cries
                    species.forEach((cry) => {
                        pkmnList.append(getPkmnCryHTML(cry, "737"));
                    });
            });
        });
    });
})(window.jQuery);
