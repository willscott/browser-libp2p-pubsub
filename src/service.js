'use strict'

const ipfs = require('ipfs');

let node = null;

module.exports = async () => {
    if (!node) {
        node = ipfs.create({
            repo: '/tmp/chatapp',
            libp2p: {
                config: {
                    dht: {
                        enabled: true
                    },
                    pubsub: {
                        enabled: true
                    }
                }
            }
        })
    }
    return await node;
}
