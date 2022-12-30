const axl = require('app-xbox-live');

class Xbox {
    constructor({ username, xuid }) {
        this.username = username;
        this.xuid = xuid;
    }
    async getXuid() {
        let { people } = await global.xbox.people.find(this.username, 1);
        return people[0].xuid;
    }
}

module.exports = Xbox;