const Database = require('../../resources/Database.js');
const Xbox = require('../../resources/Xbox.js');
const { request } = require('undici');

module.exports = (app) => ({
  get: {
    handler: async (req, res) => {
      const { xuid = null } = req.params

      if (!xuid || isNaN(parseInt(xuid))) return res.status(401).send(`Invalid Parameter: /player/(xuid) must be numerical.`);

      /**
       * Find if the XUID is linked to any users 
       * Maybe: Store XUIDs in column with their tokens, query "SELECT DiscordID FROM Tokens WHERE XUID LIKE '${xuid}'"
       * 
       * Then once user/s is/are found, double check that the accounts are still linked to said user/s.
       * Return values as [{ xuid: "", id: "" }]
       * 
       * If there is multiple discord ids associated with the user, maybe we add a timestamp and whichever one was linked first would
       * be the most likely to be the correct account?
       * 
       * OR
       * 
       * Whichever discord account has the username selected as their main account will be priority always and if then there are multiple
       * discord accounts with the same username marked as their main account, only then will the timestamps take effect?
       */
    }
  },
});