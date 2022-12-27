const { CronJob } = require('cron');
const Database = require('./resources/Database.js');
const { request } = require('undici');
const { clientId, clientSecret } = require('./config.json');

let iterator = new CronJob('0 0 * * * *', async () => {
    let oauth = new Database('Dev_Link');
    let expired = await oauth.query(`SELECT DiscordID, Refresh FROM Tokens WHERE (UNIX_TIMESTAMP() * 1000) > Expires`, false);
    await oauth.close();

    if (expired?.length) {
        for (let { DiscordID, Refresh } of expired) {
            console.log(DiscordID, Refresh);

            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					refresh_token: Refresh,
					grant_type: 'refresh_token',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await tokenResponseData.body.json();

            let oauth = new Database('Dev_Link');
            await oauth.query(`UPDATE Tokens SET Auth = '${oauthData.access_token}', Refresh = '${oauthData.refresh_token}', Expires = ${Date.now() + (oauthData.expires_in * 1000)} WHERE DiscordID = '${DiscordID}'`);
            await oauth.close();
            //Remember to check response headers from Discord for rate limits
        }
    }
}, null, false, 'America/Los_Angeles');

iterator.start();