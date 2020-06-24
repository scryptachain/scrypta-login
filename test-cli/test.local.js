let ScryptaLogin = require('../src/index.js')
let dLogin = new ScryptaLogin
const password = 'MySuperStrongPassword'
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore

async function init(){
    let request = await dLogin.listen(function(connected){
        console.log('SUCCESSFULLY RECEIVED SID FILE: ' + connected)
    })
    setTimeout(async function(){
        let newAddress = await scrypta.createAddress(password, false)
        dLogin.login(request.address, newAddress.walletstore, password)
    },2000)
}

init()