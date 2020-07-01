import _ from 'lodash'
const ScryptaLogin = require('@scrypta/login')
const ScryptaCore = require('@scrypta/core')
import css from './css/style.css'
import jsQR from "jsqr"

var video
var canvasElement
var canvas
var loadingMessage
var dapp = ''
var found = []
var required = []
var gateway = []
var callback = ''

async function initScryptaLogin() {
    const scryptalogin = new ScryptaLogin(true)
    let request = await scryptalogin.listen(function (connected) {
        loginWithSid(connected)
    })

    let checkwrapper = document.getElementById('scrypta-login-wrapper')
    if (checkwrapper === null) {
        const mainwrapper = document.createElement('div')
        mainwrapper.id = 'scrypta-login-wrapper'
        document.body.appendChild(mainwrapper)

        const bg = document.createElement('div')
        bg.id = 'scrypta-login-bg'
        mainwrapper.appendChild(bg)

        const link = document.createElement('div')
        link.id = 'scrypta-login-link'
        link.innerHTML = '<a target="_blank" href="https://scrypta.id">https//scrypta.id</a>'
        bg.appendChild(link)

        const logo = document.createElement('div')
        logo.id = "scrypta-login-logo"
        bg.appendChild(logo)

        const gfx = document.createElement('div')
        gfx.id = "scrypta-login-gfx"
        bg.appendChild(gfx)

        const wrapper = document.createElement('div')
        wrapper.id = 'scrypta-login-contents'
        mainwrapper.appendChild(wrapper)

        const logodark = document.createElement('div')
        logodark.id = "scrypta-logo-dark"
        wrapper.appendChild(logodark)

        const title = document.createElement('h1')
        if (dapp === '') {
            title.innerHTML = 'Login with ScryptaID'
        } else {
            title.innerHTML = dapp
        }
        wrapper.appendChild(title)

        const p = document.createElement('p')
        p.id = 'pchoose'
        p.innerHTML = 'Choose a login method'
        wrapper.appendChild(p)

        if (required.length > 0) {
            let requiredstring = ''
            for (let k in required) {
                required[k] = required[k].toUpperCase()
                requiredstring += ' ' + required[k]
            }
            const prequire = document.createElement('p')
            prequire.id = 'prequire'
            prequire.innerHTML = '<b>Required to login:</b> ' + requiredstring
            wrapper.appendChild(prequire)
        }

        // SELECTION

        const loginselection = document.createElement('p')
        loginselection.innerHTML = `<button id="manent-selector">Manent App</button><button id="sid-selector">SID File</button><button id="qr-selector">QR Card</button>`
        wrapper.appendChild(loginselection)

        // MANENT LOGIN

        const manentwrapper = document.createElement('div')
        manentwrapper.id = 'scrypta-manent-login'
        wrapper.appendChild(manentwrapper)

        const qrcode = document.createElement('img')
        qrcode.width = "300"
        qrcode.src = request.qrcode
        manentwrapper.appendChild(qrcode)

        const manentinstructions = document.createElement('p')
        manentinstructions.innerHTML = 'Scan this code in remote sign section of Manent App.'
        manentwrapper.appendChild(manentinstructions)

        const manentselector = document.getElementById('manent-selector')
        manentselector.onclick = function () { selectLogin('manent') }
        const sidselector = document.getElementById('sid-selector')
        sidselector.onclick = function () { selectLogin('sid') }
        const qrselector = document.getElementById('qr-selector')
        qrselector.onclick = function () { selectLogin('qr') }

        // SID LOGIN

        const sidwrapper = document.createElement('div')
        sidwrapper.id = 'scrypta-sid-login'
        wrapper.appendChild(sidwrapper)

        const inputfile = document.createElement('input')
        inputfile.type = "file"
        inputfile.id = "sid-login-input"
        inputfile.oninput = function () { loadWalletFromFile() }
        sidwrapper.appendChild(inputfile)

        const sidinstructions = document.createElement('p')
        sidinstructions.innerHTML = 'Select your .sid file from your local drive.'
        sidwrapper.appendChild(sidinstructions)

        // CARD LOGIN
        const videowrapper = document.createElement('div')
        videowrapper.id = 'scrypta-card-login'
        videowrapper.innerHTML = `<div id="loadingMessage">🎥 Unable to access video stream (please make sure you have a webcam enabled)</div>
        <canvas id="canvas" style="width:100%; height:300px;" hidden></canvas>`
        wrapper.appendChild(videowrapper)

        const qrinstructions = document.createElement('p')
        qrinstructions.innerHTML = 'Scan your QR card with your device.'
        videowrapper.appendChild(qrinstructions)

        sidwrapper.hidden = true
        videowrapper.hidden = true

        // LOGIN CONFIRM

        const confirmwrapper = document.createElement('div')
        confirmwrapper.id = 'scrypta-login-confirm'
        wrapper.appendChild(confirmwrapper)
        confirmwrapper.hidden = true

        const unlockinstructions = document.createElement('p')
        unlockinstructions.innerHTML = 'Please unlock your identities to continue.'
        confirmwrapper.appendChild(unlockinstructions)

        const inputpassword = document.createElement('input')
        inputpassword.type = "password"
        inputpassword.id = "sid-login-password"
        inputpassword.onkeypress = function (e) {
            if (e.keyCode === 13) {
                unlockScryptaIdentities()
            }
        }
        confirmwrapper.appendChild(inputpassword)

        const confirmbutton = document.createElement('div')
        confirmbutton.id = "confirm-button"
        confirmbutton.innerHTML = 'UNLOCK IDENTITIES'
        confirmbutton.onclick = function () { unlockScryptaIdentities() }
        confirmwrapper.appendChild(confirmbutton)
    }
}

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true;
        canvasElement.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            loginWithSid(code.data)
        }
    }
    requestAnimationFrame(tick)
}

function selectLogin(login) {
    const manentwrapper = document.getElementById('scrypta-manent-login')
    const videowrapper = document.getElementById('scrypta-card-login')
    const sidwrapper = document.getElementById('scrypta-sid-login')
    manentwrapper.hidden = true
    videowrapper.hidden = true
    sidwrapper.hidden = true

    switch (login) {
        case "manent":
            manentwrapper.hidden = false
            break;
        case "sid":
            sidwrapper.hidden = false
            break;
        case "qr":
            videowrapper.hidden = false
            setTimeout(function () {
                video = document.createElement("video");
                canvasElement = document.getElementById("canvas");
                canvas = canvasElement.getContext("2d");
                loadingMessage = document.getElementById("loadingMessage");
                navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
                    video.srcObject = stream;
                    video.setAttribute("playsinline", true);
                    video.play();
                    requestAnimationFrame(tick);
                });
            }, 200)
            break;
    }
}

function appendButton() {
    let checkbutton = document.getElementById('scrypta-login-button')
    if (checkbutton === null) {
        const button = document.createElement('button')
        button.id = "scrypta-login-button"
        button.innerHTML = 'Login with ScryptaID'
        button.onclick = function () { initScryptaLogin() }
        let wrapper = document.getElementById('scrypta-login')
        wrapper.appendChild(button)
        if (wrapper.getAttribute("dapp") !== null && wrapper.getAttribute("dapp") !== undefined) {
            dapp = wrapper.getAttribute("dapp")
        }
        if (wrapper.getAttribute("callback") !== null && wrapper.getAttribute("callback") !== undefined) {
            callback = wrapper.getAttribute("callback")
        }
        if (wrapper.getAttribute("required") !== null && wrapper.getAttribute("required") !== undefined) {
            required = wrapper.getAttribute("required").split(',')
        }
        if (wrapper.getAttribute("gateway") !== null && wrapper.getAttribute("gateway") !== undefined) {
            gateway = wrapper.getAttribute("gateway").split(',')
        }
    }
}

async function unlockScryptaIdentities() {
    const password = document.getElementById('sid-login-password').value
    if (password.length > 0) {
        let scrypta = new ScryptaCore(true)
        let sid = localStorage.getItem('SID')
        let key = await scrypta.readKey(password, sid)
        let confirmed = {}
        if (key !== false) {
            for (let k in required) {
                if (key.identity[required[k].toLowerCase()] !== undefined) {
                    let id = key.identity[required[k].toLowerCase()]
                    let fingerprint = id.fingerprint
                    let signed = await scrypta.signMessage(key.prv, JSON.stringify(id))
                    for (let z in found) {
                        if (found[z].signature === signed.signature) {
                            let verify = await scrypta.verifyMessage(key.key, found[z].signature, JSON.stringify(id))
                            if(verify !== false){
                                if (gateway.length === 0) {
                                    confirmed[required[k].toLowerCase()] = id
                                } else {
                                    if(gateway.indexOf(found[z].gateway) !== -1){
                                        confirmed[required[k].toLowerCase()] = id
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (Object.keys(confirmed).length === required.length) {
                let complete = {
                    sid: localStorage.getItem('SID'),
                    ids: confirmed
                }
                if (callback !== null) {
                    window[callback](complete)
                } else {
                    alert("Can't login without callback function!")
                }
            } else {
                alert("Your identity doesn't contain required proof.")
            }
        } else {
            alert('Wrong password!')
        }
    } else {
        alert('Write your password first!')
    }
}

function loadWalletFromFile() {
    const file = document.getElementById('sid-login-input')
    const reader = new FileReader();
    reader.onload = function () {
        var dataKey = reader.result;
        loginWithSid(dataKey)
    };
    reader.readAsText(file.files[0]);
}

function checkIdentity(address) {
    return new Promise(async response => {
        let scrypta = new ScryptaCore(true)
        let ids = await scrypta.post('/read', { address: address, protocol: 'I://' })
        for (let k in ids.data) {
            let id = ids.data[k]
            if (required.indexOf(id.refID) !== -1) {
                let identity = id.data
                found.push(identity)
            }
        }
        if (found.length === required.length) {
            response(true)
        } else {
            response(false)
        }
    })
}

async function loginWithSid(sid) {
    let SIDS = sid.split(':')
    localStorage.setItem('SID', sid)
    localStorage.setItem('sid_backup', SIDS[0])
    if (required.length > 0) {
        let logged = await checkIdentity(SIDS[0])
        if (logged) {
            const manentwrapper = document.getElementById('scrypta-manent-login')
            const videowrapper = document.getElementById('scrypta-card-login')
            const sidwrapper = document.getElementById('scrypta-sid-login')
            const manentselector = document.getElementById('manent-selector')
            const videoselector = document.getElementById('qr-selector')
            const sidselector = document.getElementById('sid-selector')
            const confirmwrapper = document.getElementById('scrypta-login-confirm')
            const prequire = document.getElementById('prequire')
            const pchoose = document.getElementById('pchoose')
            manentwrapper.hidden = true
            videowrapper.hidden = true
            sidwrapper.hidden = true
            manentselector.hidden = true
            videoselector.hidden = true
            sidselector.hidden = true
            prequire.hidden = true
            pchoose.hidden = true
            confirmwrapper.hidden = false
        } else {
            alert("Please make sure you have all required identities.")
        }
    } else {
        if (callback === null) {
            location.reload()
        } else {
            window[callback]({ sid: sid })
        }
    }
}

appendButton()
window.initScryptaLogin = function () { appendButton() }