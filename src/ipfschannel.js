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
        console.log(myCid.toString(), '=>', this.service.pubsub.publish(myCid.toString(), jsonmsg))
        return true;
    }

    roomCid() {
        let enc = new TextEncoder();
        let myCid = new CID(1, multicodec.IDENTITY, multihash.encode(enc.encode(this.room), 'identity'))
        return myCid;
    }

    async open() {
        this.service = await service()

        return true;
    }
    register(roomid, clientid) {
        this.room = roomid;
        let myCid = this.roomCid()
        console.log('register:', roomid, myCid.toString(), JSON.stringify(clientid))
        this.service.pubsub.subscribe(myCid.toString(), (msg) => {
            if (msg.from == clientid) {
                return;
            }
            var textDecoder = new TextDecoder("utf-8");
            let rawMsg = textDecoder.decode(msg.data);
            console.log("incoming msg:",msg, rawMsg)
            this.onmessage(rawMsg);
        })
        return true;
    }
}

module.exports = ipfschannel;
