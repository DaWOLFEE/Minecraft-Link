const { readdir, lstat } = require('fs').promises;
const p = require('path');

let paths = [];

module.exports = async bot => {
    await findFiles(p.resolve('./interactions/'));

    for (let file of paths.filter(x => x.endsWith('.js'))) {
        let exported = require(p.resolve(file));
        exported.path = file;
        bot.interactions.set(exported?.command?.name?.toLowerCase() || file.split('/').find(x => x.includes('.js')).replaceAll('.js', '').replaceAll('/', ''), exported);
    }
}

async function findFiles(path) {
    for (let file of await readdir(path)) 
        ((await lstat(p.join(path, file))).isDirectory()) ? paths.concat(await findFiles(p.join(path, file)) || []) : paths.push(`${path}/${file}`);
    return paths;
}