'use strict'

const service = require('./service');
const CID = require('cids');
const { multicodec, multihash } = require('ipfs/src');

class ipfschannel {
    constructor() {
        this.onmessage = () => {}
    }
    close(async) {
        if (this.service) {
            let myCid = this.roomCid()
            return this.service.pubsub.unsubscribe(myCid.toString())
        }
        return true;
    }
    send(jsonmsg) {
        console.log('sendmsg:', jsonmsg)
        let myCid = this.roomCid()
        this.service.pubsub.publish(myCid.toString(), jsonmsg)
        return true;
    }

    roomCid() {
        let enc = new TextEncoder();
        let myCid = new CID(1, multicodec.IDENTITY, multihash.encode(enc.encode(this.room), 'identity'))
        return myCid;
    }

    async open() {
        this.service = await service()

        let myCid = this.roomCid()
        this.service.pubsub.subscribe(myCid.toString(), (msg) => {
            console.log("incoming msg:",msg)
            this.onmessage(msg);
        })

        return true;
    }
    register(roomid, clientid) {
        this.room = roomid;
        console.log('register:', roomid, JSON.stringify(clientid))
        return true;
    }
}

module.exports = ipfschannel;
