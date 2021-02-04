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
        this.shadowRoot.children[3].addEventListener('click', this.onClick.bind(this))
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
        let myCid = this.roomCid()
        console.log('pub ', myCid.toString(), this.node.pubsub.publish(myCid.toString(), "ping"))
    }

    async joinRoom() {
        let node = await service();
        this.node = node;
        const { id, agentVersion, protocolVersion } = await node.id();

        this.log += JSON.stringify({ id, agentVersion, protocolVersion });
        this.Render()

        let myCid = this.roomCid()

        //this.onProvider(node.libp2p._dht.findProviders(myCid))
        this.watchTopic()
        //node.libp2p._dht.provide(myCid)
    }

    makeCall(me, them) {
        console.log('clid will be:', me)
        let rtc = document.createElement('app-rtc');
        rtc.setAttribute('room', this.room);
        rtc.setAttribute('clientid', me);
        rtc.setAttribute('remoteid', them);
        rtc.setAttribute('slot', 'video');
        rtc.style.position = 'absolute';
        rtc.style.left = 0;
        rtc.style.top = 0;
        rtc.style.width='100%';
        rtc.style.height = '100%';
        this.appendChild(rtc);
    }

    /*
    async onProvider(providerGen, y) {
        if (y && y.done) {
            setTimeout(() => {
                let myCid = this.roomCid()
                this.onProvider(this.node.libp2p._dht.findProviders(myCid))
            }, 30*1000)
            return
        } else if (y && y.value) {
            if (y.value.id.toString() != (await this.node.id()).toString()) {
                // found someone else in the room.
                // TODO: attempt additional connections to them.
                console.log('Found another peer via DHT!');
                let conns = await this.node.swarm.peers()
                this.node.swarm.connect(
                    `${conns[0].addr.toString()}/p2p-circuit/p2p/${y.value.id}`
                  );
                console.log(y.value)
            }
        }
        providerGen.next().then((r) => {this.onProvider(providerGen, r);})
    }
    */

    
    async watchTopic() {
        let myCid = this.roomCid()
        const { id, agentVersion, protocolVersion } = await this.node.id();
        this.node.pubsub.subscribe(myCid.toString(), (msg) => {
            this.log += JSON.stringify(msg)
            this.Render()
            if (msg.from == id) {
                return
            }
            this.node.pubsub.unsubscribe(myCid.toString())
            this.makeCall(id, msg.from)
        })

        setTimeout(() => {
            console.log('pub ', myCid.toString(), this.node.pubsub.publish(myCid.toString(), "ping"))
        }, 2000)
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
<button id='ping'>Probe for others</button>
`;


module.exports = chatroom;
