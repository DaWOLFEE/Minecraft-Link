module.exports = (app) => ({
    get: {
      handler: async (req, res) => {
        const params = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            redirect_uri: (process.env.URL || 'http://localhost:8080') + '/auth/callback',
            scope: 'connections',
            response_type: 'code'
        });
    
        return res.redirect("https://discord.com/api/oauth2/authorize?" + params);
      }
    },
  });