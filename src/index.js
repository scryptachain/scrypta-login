const ScryptaCore = require('@scrypta/core')
const QRCode = require('qrcode')

module.exports = class ScryptaLogin {
    constructor(isBrowser = false) {
        if (isBrowser) {
            this.scrypta = new ScryptaCore(true)
        } else {
            this.scrypta = new ScryptaCore
        }
    }

    listen(cb) {
        const app = this
        return new Promise(async response => {
            let newAddress = await app.scrypta.createAddress('temp', false)
            let qrcode = await QRCode.toDataURL('login:' + newAddress.pub)
            response({
                address: newAddress.pub,
                qrcode: qrcode
            })
            app.scrypta.connectP2P(function (received) {
                try {
                    let parsed = JSON.parse(received.message)
                    if (parsed.protocol !== undefined && parsed.protocol === 'login://' && parsed.request !== undefined && parsed.request === newAddress.pub) {
                        if (app.isBrowser) {
                            let SIDS = parsed.sid.split(':')
                            localStorage.setItem('SID', parsed.sid)
                            localStorage.setItem('sid_backup', SIDS[0])
                        }
                        cb(parsed.sid)
                    }
                } catch (e) {
                    console.log('Message not related to login')
                }
            })
        })
    }

    ui() {
        const app = this
        if (app.isBrowser) {
            let newAddress = await app.scrypta.createAddress('temp', false)
            let qrcode = await QRCode.toDataURL('login:' + newAddress.pub)
            app.scrypta.connectP2P(function (received) {
                try {
                    let parsed = JSON.parse(received.message)
                    if (parsed.protocol !== undefined && parsed.protocol === 'login://' && parsed.request !== undefined && parsed.request === newAddress.pub) {
                        if (app.isBrowser) {
                            let SIDS = parsed.sid.split(':')
                            localStorage.setItem('SID', parsed.sid)
                            localStorage.setItem('sid_backup', SIDS[0])
                        }
                    }
                } catch (e) {
                    console.log('Message not related to login')
                }
            })
        } else {
            console.log("CAN'T CREATE UI WITHOUT BROWSER.")
        }
    }

    login(request, sid, password) {
        const app = this
        app.scrypta.connectP2P()
        setInterval(function () {
            app.scrypta.broadcast(sid, password, 'message', JSON.stringify({
                protocol: 'login://',
                request: request,
                sid: sid
            }))
        }, 2000)
    }
}
