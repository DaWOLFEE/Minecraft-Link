const { CronJob } = require('cron');
const Database = require('./resources/Database.js');

let iterator = new CronJob('0 0 * * * *', async () => {
    let oauth = new Database('Dev_Link');
    let expired = await oauth.query(`SELECT DiscordID, Refresh FROM Tokens WHERE (UNIX_TIMESTAMP() * 1000) > Expires`, false);
    await oauth.close();

    if (expired?.length) {
        for (let { DiscordID, Refresh } of expired) {
            console.log(DiscordID, Refresh);

            //Hourly refresh of expired tokens
            //Remember to check response headers from Discord for rate limits
        }
    }
}, null, false, 'America/Los_Angeles');

iterator.start();