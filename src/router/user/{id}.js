const Database = require('../../resources/Database.js');
const { request } = require('undici');

module.exports = (app) => ({
  get: {
    handler: async (req, res) => {
      const { id = null } = req.params

      if (!id || isNaN(parseInt(id))) return res.status(401).send(`Invalid Parameter: /user/(id) must be numerical.`);

      const oauth = new Database();
      let token = await oauth.query(`SELECT * FROM Tokens WHERE DiscordID = '${id}'`);

      if (!token) return res.status(404).send(`Non-existant Parameter: /user/${id} hasn't been linked yet.`);
      if (token.Expires < Date.now()) {

        const body = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: token.Refresh,
          grant_type: 'refresh_token',
        }).toString();

        const refresh = await request('https://discord.com/api/oauth2/token', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
          .then(res => res.body.json())
          .catch(() => { /* ERR */ });

        await oauth.query(`UPDATE Tokens SET Auth = '${refresh.access_token}', Refresh = '${refresh.refresh_token}', Expires = ${Date.now() + (refresh.expires_in * 1000)} WHERE DiscordID = '${DiscordID}'`);
        token.Auth = refresh.access_token;
      }

      await oauth.close();

      const user = await request('https://discord.com/api/users/@me/connections', { headers: { authorization: `Bearer ${token.Auth}` } })
        .then(res => res.body.json())
        .catch(console.trace);

      return res.status(200).send(user);
    }
  },
});