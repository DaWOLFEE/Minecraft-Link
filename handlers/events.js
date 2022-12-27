const { readdir } = require('fs').promises;
const p = require('path');

module.exports = async bot => {
    for (let dir of (await readdir(p.resolve('./events/')))) {
        for (let file of (await readdir(p.join(p.resolve(`./events/`), dir))).filter(file => file.endsWith('.js'))) {
            let exported = require(p.join(p.resolve(`./events/`, dir, file)));
            bot.on(file.split('.')[0], exported.bind(null, bot));
        }
    }
}