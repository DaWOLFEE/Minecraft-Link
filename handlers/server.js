const fastify = require('fastify');

const app = fastify({ logger: false });
app.register(require('@fastify/websocket'));

module.exports = async bot => {
    app.get('/', (request, reply) => {
        reply.send({
            uptime: bot.uptime, servers: bot.guilds.cache.size, members: bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)
        });
    });


    app.register(async function (app) {
        //create some sort of authentication for the websockets so only the api may connect
        app.get('/api/websocket', { websocket: true }, (connection, req) => {
            connection.socket.on('message', message => {
                //depending on the message a function will run
                console.log(message)
                //return data / run chechs / run a function
                connection.socket.send('Hello Fastify WebSockets');
            });
        });

        app.get('/api/ping', { websocket: true }, (connection, req) => {
            connection.socket.pingInterval = setInterval(() => {
                connection.socket.send('ping');
            }, 10000);

            connection.socket.on('close', () => {
                clearInterval(connection.socket.pingInterval);
            });
        });
    })


    app.listen({ host: '0.0.0.0', port: '3000' }, (err, address) => {
        if (err) return console.trace(err);

        console.log(`Server started at ${address}`);
    });
}