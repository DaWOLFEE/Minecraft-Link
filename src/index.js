//https://discord.com/api/oauth2/authorize?client_id=817578017453899776&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Fdiscord%2Fredirect&response_type=code&scope=identify%20connections

const { port, clientId, clientSecret } = require('./config.json');
const express = require('express');
const app = express();
const { request } = require('undici');
const Database = require('./resources/Database.js');

app.get('/api/auth/discord/redirect', async ({ query }, response) => {
	const { code } = query;

	if (code) {
		try {
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `http://localhost:8080/api/auth/discord/redirect`,
					scope: 'connections',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await tokenResponseData.body.json();
            console.log(oauthData);

			const userResult = await request('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${oauthData.token_type} ${oauthData.access_token}`,
				},
			});

            console.log(userResult.headers);
            let user = await userResult.body.json();

            let oauth = new Database('Dev_Link');
            let authed = await oauth.query(`SELECT DiscordID FROM Tokens WHERE DiscordID = '${user.id}'`);
            authed ? await oauth.query(`UPDATE Tokens SET Auth = '${oauthData.access_token}', Refresh = '${oauthData.refresh_token}', Expires = ${Date.now() + (oauthData.expires_in * 1000)} WHERE DiscordID = '${user.id}'`) : await oauth.query(`INSERT INTO Tokens (DiscordID, Auth, Refresh, Expired) VALUES ('${user.id}', '${oauthData.access_token}', '${oauthData.refresh_token}', ${Date.now() + (oauthData.expires_in * 1000)})`);
            await oauth.close();

			console.log(user);
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error
			// tokenResponseData.statusCode will be 401
			console.error(error);
		}
	}

	return response.redirect('https://discord.com/oauth2/authorized');
});

app.get('/api/user/:id', async (req, res) => {
    let { id } = req.params;

    let reg = new RegExp(/^\d+$/g);
    if (!reg.test(id)) return res.status(401).send(`Invalid Parameter: /api/user/(id) must be numerical.`);

    let oauth = new Database('Dev_Link');
    let token = await oauth.query(`SELECT * FROM Tokens WHERE DiscordID = '${id}'`);

    if (!token) return res.status(404).send(`Non-existant Parameter: /apu/user/${id} hasn't been linked yet.`);
    if (token.Expires < Date.now()) {
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

            await oauth.query(`UPDATE Tokens SET Auth = '${oauthData.access_token}', Refresh = '${oauthData.refresh_token}', Expires = ${Date.now() + (oauthData.expires_in * 1000)} WHERE DiscordID = '${DiscordID}'`);
            token.Auth = oauthData.access_token;
    }

    await oauth.close();

    const userResult = await request('https://discord.com/api/users/@me/connections', {
        headers: {
            authorization: `Bearer ${token.Auth}`,
        },
    });

    let user = await userResult.body.json();
    res.status(200).send(user);
});

app.listen(port, () => console.log(`${port}`));

require('./refresh.js');