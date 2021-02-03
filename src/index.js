const IPFS = require('ipfs');
const renderer = require('./renderer');
const changeEvent = require('./event');

const root = require('./component/root');
const chat = require('./component/chat');
const apprtc = require('./component/apprtc');

let renderedRoot = null;

function setup(rootEl) {
    renderedRoot = renderer.FillSlot(rootEl, 'root', root, '');
    changeEvent();
}

async function GetState() {
    if(renderedRoot == null) {
        return "";
    }
    return await renderedRoot.GetState();
}

async function UpdateState(s) {
    let rootEl = document.getElementById('root');
    if (renderedRoot == null || !await renderedRoot.UpdateState(s)) {
        renderedRoot = await renderer.RestoreSlot(rootEl, 'root', root, s);
    }
}

let onLoad = () => {
    renderer.Register(root);
    renderer.Register(chat);
    renderer.Register(apprtc);

    document.addEventListener(changeEvent.Event.type, async () => {
        let newState = await GetState();
        if (newState != history.state) {
            history.pushState(newState, "", "?state=" + btoa(JSON.stringify(newState)) + window.location.hash);
        }
    });
    window.onpopstate = (ev) => {
        if (!ev.state) {
            // this happens e.g. when clicking on the anchor links.
            GetState().then(s => {
                history.replaceState(s, "", "?state=" + btoa(JSON.stringify(s)) + window.location.hash);
            });
        } else {
            UpdateState(ev.state);
        }
    };
    if (window.location.search.indexOf("state=") > -1) {
        let str = decodeURIComponent(window.location.search.split("state=").slice(1).join("state="));
        str = atob(str);
        UpdateState(JSON.parse(str)).then(() => {
            if (window.location.hash != "") {
                window.location.hash = window.location.hash;
            }
        });
    } else {
        UpdateState(0);
    }
}

window.addEventListener('load', onLoad);
