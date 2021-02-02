'use strict'

const renderer = require('../renderer');
const changeEvent = require('../event');
const chatroom = require('./chat');

class root {
    constructor(element, room, args) {
        this.element = element;
        this.room = room || '';

        this.form = this.element.shadowRoot.children[1].children[0];
        this.form.addEventListener('submit', this.setRoom.bind(this), false);
        this.Render();
    }

    Render() {
        let existing = this.element.querySelector('[slot="room"]');
        if (existing != undefined) {
            this.element.removeChild(existing);
        }

        if(this.room == '') {
            this.form.style.display='block';
        } else {
            this.form.style.display='none';
            let node = document.createElement('chat-room');
            node.slot = 'room';
            node.innerText = this.room;
            this.element.appendChild(node);
        }
    }

    static async RestoreFromState(element, args, state) {
        if (!args) {
            args =[];
        }
        let inst = new root(element, args[0], args[1]);
        await inst.UpdateState(state);
        return inst;
    }

    async GetState() {
        if(this.room == '') {
            return 0;
        } else {
            return [this.room];
        }
    }

    async UpdateState(s) {
        if (s===0 || s===[]) {
            if (this.room != '') {
              this.room = '';
            }
            this.doSetRoom('');
            return true;
        } else if (this.room == '') {
            this.doSetRoom(s[0]);
        }
        return false;
    }

    doSetRoom(rm) {
        this.room = rm;
        this.Render();
    }
    setRoom(ev) {
        ev.preventDefault();
        let rm = this.form[0].value;
        this.doSetRoom(rm);
        changeEvent();
        return false;
    }

    Close() {
        this.element.innerHTML = "";
    }
}

root.Name = 'chat-root';

root.Template = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
<main style='width: 100%;max-width: 330px;padding: 15px;margin: auto;'>
  <form>
    <h1 class="h3 mb-3 fw-normal">Enter Room</h1>
    <label for="room" class="visually-hidden">Room:</label>
    <input type="text" id="room" placeholder="MyCoolRoom" required autofocus style='position: relative; box-sizing: border-box; height: auto;padding: 10px;font-size: 16px;'>
    <button class="w-100 btn btn-lg btn-primary" type="submit">Enter</button>
  </form>
  <slot name="room">
  </slot>
</main>
`;


module.exports = root;
