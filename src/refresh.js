const Database = require('./resources/Database.js');
const { request } = require('undici');
const { CronJob } = require('cron');

let iterator = new CronJob('0 0 * * * *', async () => {
    const OAuth = new Database();
    let expired = await OAuth.query(`SELECT DiscordID, Refresh FROM Tokens WHERE (UNIX_TIMESTAMP() * 1000) > Expires`, false);

    if (expired?.length) {
        for (let { DiscordID, Refresh } of expired) {
            console.log(DiscordID, Refresh);
            const body = new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                refresh_token: Refresh,
                grant_type: 'refresh_token',
            }).toString();

            const refresh = await request('https://discord.com/api/oauth2/token', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(res => res.body.json())
                .catch(console.trace);

            await OAuth.query(`UPDATE Tokens SET Auth = '${refresh.access_token}', Refresh = '${refresh.refresh_token}', Expires = ${Date.now() + (refresh.expires_in * 1000)} WHERE DiscordID = '${DiscordID}'`);
            //Remember to check response headers from Discord for rate limits
        }
    }
    await OAuth.close();
}, null, false, 'America/Los_Angeles');

iterator.start();