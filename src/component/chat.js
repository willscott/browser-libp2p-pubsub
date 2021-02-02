'use strict'

const renderer = require('../renderer');
const service = require('../service');

class chatroom extends HTMLElement {
    constructor() {
        super();
        
        const shadowRoot = this.attachShadow({mode: 'open'})
        .appendChild(chatroom.Template.content.cloneNode(true));
        this.joinRoom();
        this.Render();
    }
    Render() {
        let log = this.shadowRoot.getElementById('log');
        log.innerHTML = 'Loading...';
    }

    async joinRoom() {
        let node = await service();
        const { id, agentVersion, protocolVersion } = await node.id()

        let log = this.shadowRoot.getElementById('log');
        log.innerHTML = JSON.stringify({ id, agentVersion, protocolVersion });
    }

    Close() {
        this.innerHTML = "";
    }

}

chatroom.Name = 'chat-room';

chatroom.Template = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
<pre id='log'></pre>
`;


module.exports = chatroom;
