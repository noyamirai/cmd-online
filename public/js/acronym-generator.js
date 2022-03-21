// Got this from stackoverflow but forgot where
const createAcronym = (string) => {
    return string.split(` `).map(i => i.charAt(0)).toString().toUpperCase().split(`,`).slice(0, 2).join(``);
};

module.exports.createAcronym = createAcronym;