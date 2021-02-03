'use strict'

const service = require('./service');

class ipfschannel {
    constructor() {
        this.onmessage = () => {}
    }
    close(async) {
        return true;
    }
    send(jsonmsg) {
        console.log('sendmsg:', jsonmsg)
        return true;
    }
    async open() {
        this.service = await service()

        return true;
    }
    register(roomid, clientid) {
        console.log('register:', clientid)
        return true;
    }
}

module.exports = ipfschannel;
