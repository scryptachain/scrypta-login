import _ from 'lodash'
const ScryptaLogin = require('@scrypta/login')
import css from './css/scryptastyle.css'
import sen from './css/sen.css'
import mdi from './css/mdi.min.css'
import jsQR from "jsqr"

var video
var canvasElement
var canvas
var loadingMessage
var dapp 
var required
var optional

async function initScryptaLogin() {
    const scryptalogin = new ScryptaLogin(true)
    let request = await scryptalogin.listen(function (connected) {
        loginWithSid(connected)
    })

    let checkwrapper = document.getElementById('scrypta-login-wrapper')
    if(checkwrapper === null){
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

        const title = document.createElement('h1')
        title.innerHTML = 'Login with ScryptaID'
        wrapper.appendChild(title)

        const p = document.createElement('p')
        p.innerHTML = 'Select your preferred login method'
        wrapper.appendChild(p)

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
        manentinstructions.innerHTML = 'Scan this code in login section.'
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
    if(checkbutton === null){
        const button = document.createElement('button')
        button.id = "scrypta-login-button"
        button.innerHTML = 'Login with ScryptaID'
        button.onclick = function () { initScryptaLogin() }
        let wrapper = document.getElementById('scrypta-login')
        wrapper.appendChild(button)
        dapp = wrapper.getAttribute("dapp")
        required = wrapper.getAttribute("required").split(',')
        optional = wrapper.getAttribute("optional").split(',')
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

function loginWithSid(sid) {
    let SIDS = sid.split(':')
    localStorage.setItem('SID', sid)
    localStorage.setItem('sid_backup', SIDS[0])
}

appendButton()
window.initScryptaLogin = function() { appendButton() }