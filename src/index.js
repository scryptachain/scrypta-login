const ScryptaCore = require('@scrypta/core')
const QRCode = require('qrcode')

module.exports = class ScryptaLogin {
    constructor(isBrowser = false) {
        this.isBrowser = false
        if (isBrowser) {
            this.isBrowser = true
            this.scrypta = new ScryptaCore(true)
        } else {
            this.scrypta = new ScryptaCore
        }
    }

    listen(cb) {
        const app = this
        return new Promise(async response => {
            let newAddress = await app.scrypta.createAddress('temp', false)
            var opts = {
                errorCorrectionLevel: 'H',
                quality: 1,
                margin: 0,
            }
            let qrcode = await QRCode.toDataURL('login:' + newAddress.pub, opts)
            response({
                address: newAddress.pub,
                qrcode: qrcode
            })
            app.scrypta.connectP2P(function (received) {
                try {
                    let parsed = JSON.parse(received.message)
                    if (parsed.protocol !== undefined && parsed.protocol === 'login://' && parsed.request !== undefined && parsed.request === newAddress.pub) {
                        cb(parsed.sid)
                    }
                } catch (e) {
                    console.log('Message not related to login')
                }
            })
        })
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
