'use strict'

const renderer = require('../renderer');
const service = require('../service');
const CID = require('cids');
const { multicodec, multihash } = require('ipfs/src');

class chatroom extends HTMLElement {
    constructor() {
        super();
        
        const shadowRoot = this.attachShadow({mode: 'open'})
        .appendChild(chatroom.Template.content.cloneNode(true));
        this.log = '';
        this.joinRoom();
        this.Render();
        this.shadowRoot.children[2].addEventListener('click', this.onClick.bind(this))
    }
    Render() {
        let log = this.shadowRoot.getElementById('log');
        log.innerHTML = this.log || 'Loading...';
    }

    roomCid() {
        this.room = this.innerHTML;
        let enc = new TextEncoder();
        let myCid = new CID(1, multicodec.IDENTITY, multihash.encode(enc.encode(this.room), 'identity'))
        return myCid;
    }

    async onClick() {
        await this.node.pubsub.publish(this.roomCid().toString(), 'ping from ' + (await this.node.id()).toString())
    }

    async joinRoom() {
        let node = await service();
        this.node = node;
        const { id, agentVersion, protocolVersion } = await node.id();

        this.log += JSON.stringify({ id, agentVersion, protocolVersion });
        this.Render()

        let myCid = this.roomCid()

        this.onProvider(node.libp2p._dht.findProviders(myCid))
        this.watchTopic()
        node.libp2p._dht.provide(myCid)

        console.log('clid will be:', id)
        let rtc = document.createElement('app-rtc');
        rtc.setAttribute('room', this.room);
        rtc.setAttribute('clientid', id);
        rtc.setAttribute('slot', 'video');
        rtc.style.position = 'absolute';
        rtc.style.left = 0;
        rtc.style.top = 0;
        rtc.style.width='100%';
        rtc.style.height = '100%';
        this.appendChild(rtc);
    }

    async onProvider(providerGen, y) {
        if (y && y.done) {
            setTimeout(() => {
                let myCid = this.roomCid()
                this.onProvider(this.node.libp2p._dht.findProviders(myCid))
            }, 60*1000)
            return
        } else if (y && y.value) {
            if (y.value.id.toString() != (await this.node.id()).toString()) {
                // found someone else in the room.
                // TODO: attempt additional connections to them.
                console.log(y.value)
            }
        }
        providerGen.next().then((r) => {this.onProvider(providerGen, r);})
    }

    async watchTopic() {
        let myCid = this.roomCid()
        this.node.pubsub.subscribe(myCid.toString(), (msg) => {
            this.log += JSON.stringify(msg)
            this.Render()
        })
        console.log(this.node.pubsub)
    }

    Close() {
        this.innerHTML = "";
    }

}

chatroom.Name = 'chat-room';

chatroom.Template = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
<pre id='log'></pre>
<slot name="video" style="position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index: 10;"></slot>
<button id='ping'>Ping</button>
`;


module.exports = chatroom;
