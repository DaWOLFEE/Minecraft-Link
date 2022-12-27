const Database = require('../../resources/Database.js');
const { request } = require('undici');

module.exports = (app) => ({
    get: {
        handler: async (req, res) => {
            const { code = null } = req.query;

            const params = new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                redirect_uri: (process.env.URL || 'http://localhost:8080') + '/auth/callback',
                scope: 'connections',
                response_type: 'code'
            });
            if (!code || typeof code != "string") return res.redirect("https://discord.com/api/oauth2/authorize?" + params);

            const body = new URLSearchParams({
                client_secret: process.env.CLIENT_SECRET,
                client_id: process.env.CLIENT_ID,
                grant_type: "authorization_code",
                redirect_uri: (process.env.URL || 'http://localhost:8080') + '/auth/callback',
                scope: 'connections',
                code
            }).toString();

            const token = await request('https://discord.com/api/oauth2/token', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(res => res.body.json())
                .catch(() => { /* ERR */ });

            if (!token) return res.redirect("https://discord.com/api/oauth2/authorize?" + params);

            const OAuth = await request("https://discord.com/api/v9/users/@me", { method: 'GET', headers: { Authorization: `Bearer ${token.access_token}` } })
                .catch(console.trace);

            const user = await OAuth.body.json();

            let oauth = new Database();
            let authed = await oauth.query(`SELECT DiscordID FROM Tokens WHERE DiscordID = ${user.id}`);
            let query = authed ? `UPDATE Tokens SET Auth = '${token.access_token}', Refresh = '${token.refresh_token}', Expires = ${Date.now() + (token.expires_in * 1000)} WHERE DiscordID = ${user.id}` : `INSERT INTO Tokens (DiscordID, Auth, Refresh, Timestamp) VALUES (${user.id}, '${token.access_token}', '${token.refresh_token}', ${Date.now() + (token.expires_in * 1000)})`
            await oauth.query(query);
            await oauth.close();

            return res.redirect('https://discord.com/oauth2/authorized');
        }
    },
});