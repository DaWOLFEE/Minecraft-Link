const { parse, resolve } = require('path');
const { readdirSync } = require('fs');

module.exports = async bot => {
    const Interactionfiles = getFiles('./interactions');
    for (const file of Interactionfiles) {
        let exported = require(resolve(file));

        exported.path = file;
        bot.interactions.set(exported?.command?.name?.toLowerCase() || parse(file).name, exported);
    }
}

function getFiles(dir) {
    return readdirSync(dir, { withFileTypes: true })
        .map(file => file.isDirectory() ? getFiles(`${dir}/${file.name}`) : `${dir}/${file.name}`).flat();
}