const fastify = require('fastify');
require('dotenv').config();
require('./refresh.js');
const axl = require('app-xbox-live');

axl.Login(process.env.XBOX_EMAIL, process.env.XBOX_PASSWORD)
    .then(x => {
        global.xbox = x;
        console.log('Xbox services online.');

        const app = fastify({ logger: false });

        app.register(require('fastify-autoroutes'), {
          dir: `${__dirname}/router`,
        });
        
        app.listen({ host: '0.0.0.0', port: '8080' }, (err, address) => {
          if (err) return console.trace(err);
        
          console.log(`Server started at ${address}`);
        });
    })
    .catch(console.trace);

