'use strict'

const ipfs = require('ipfs');
//const filters = require('libp2p-websockets/src/filters')
//const Websockets = require('libp2p-websockets')

let node = null;
//const transportKey = Websockets.prototype[Symbol.toStringTag]

module.exports = async () => {
    if (!node) {
        node = ipfs.create({
            repo: '/tmp/chatapp',
            relay: {
                enabled: true,
            },
            libp2p: {
                config: {
                    dht: {
                        enabled: true
                    },
                    pubsub: {
                        enabled: true
                    },
                    //transport: {
                    //    [transportKey]: {
                    //      filter: filters.all
                    //    }
                    //  }
                }
            }
        })
        await (await node).swarm.connect("/dns4/nxdomain.dev/tcp/443/wss/p2p/QmVLS4EgCdw8onfFLU9t25a4oAbGvetRhD9jyN5UziDQiu")
        //await (await node).swarm.connect("/ip4/127.0.0.1/tcp/4002/ws/p2p/QmVLS4EgCdw8onfFLU9t25a4oAbGvetRhD9jyN5UziDQiu")
    }
    return await node;
}
