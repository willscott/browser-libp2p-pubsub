'use strict'

const ipfs = require('ipfs');

let node = null;

module.exports = async () => {
    if (!node) {
        node = ipfs.create({ repo: String(Math.random() + Date.now()) })
    }
    return await node;
}
