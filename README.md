# Login with ScryptaID

<p><a href="https://camo.githubusercontent.com/4e892209b4b1e2d1a773ec97e544a92f068a6f0b/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f6d61782f333136382f312a31674778414b57714b5135577a635170755f766932412e6a706567" target="_blank" rel="noopener noreferrer"><img style="display: block; margin-left: auto; margin-right: auto;" src="https://camo.githubusercontent.com/4e892209b4b1e2d1a773ec97e544a92f068a6f0b/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f6d61782f333136382f312a31674778414b57714b5135577a635170755f766932412e6a706567" alt="" data-canonical-src="https://miro.medium.com/max/3168/1*1gGxAKWqKQ5WzcQpu_vi2A.jpeg" /></a></p>
<p style="text-align: center;">&nbsp;&nbsp;<a title="English &mdash; Scrypta Wiki" href="https://en.scrypta.wiki" target="_blank" rel="nofollow noopener"><strong>Wiki English</strong></a>&nbsp;&middot; &middot; &middot;&nbsp;<a title="Italiano &mdash; Scrypta Wiki" href="https://it.scrypta.wiki" target="_blank" rel="nofollow noopener"><strong>Wiki italiano</strong></a></p>

## Main Features

This tool is useful if you need to easily implement a login system with Scrypta. By default the tool produces an UI where the user can enter with:

- Manent App: by usign the remote signing tool
- Sid File: manually import previoysly stored .sid file
- QR card: using a printed card

You can even choose what kind of identities the user must have so you can recognize him as a qualified user or leave the required attribute blank to allow anonymous users.

## How to use it

First of all you need to include it in your project by including the `scrypta.login.min.js` file like:

```
<script src="./scrypta.login.min.js"></script>
```

You can even use the IPFS version, the hash is: `QmUJC9E13eYMPfMMhPeVMrBWZGZ8F8JWriUUfL3NPWemsA` like this:

```
<script src="https://ipfs.io/ipfs/QmUJC9E13eYMPfMMhPeVMrBWZGZ8F8JWriUUfL3NPWemsA"></script>
```

Then you need to write the rendering html, where you want to render the button:

```
<div id="scrypta-login" dapp="Demo dApp" callback="testCallback" required="phone"></div>
```

You can customize the login process by including these attributes:
- _dapp_: customize showed title
- _callback_: call the given callback when the login is successful, is **required** if you include one or more required identities, the return object will include it
- _required_: the list of required identifiers separated by a comma (ex. phone,mail,ethereum,twitter)
- _gateway_: if you want to admit one or more identity gateways, in this case you need to insert one or more pubkeys (ex. `0240f294ef20c7bbb82bae24d8d22c7ab94d195adf153162482b6bf540393d7dd5`)

## Test the project

If you want to test it you can simply download the package with `git clone`, install all dependencies with `npm install` and run the development enviorment with `npm run dev`.

## Check the integrity with the blockchain

If you need to check the integrity of the file please use `scrypta-bvc` tool as documented here: https://github.com/scryptachain/scrypta-blockchain-versioning-cli.

All the updates will be uploaded at https://proof.scryptachain.org/#/address/LiRXTmP4fe8Q3C3c9VtzzPHaxhMWnVRpTh

## Demo page

Check out this link to run a simple demo, available even at `webpack/dist/index.html`: 
https://scryptachain.github.io/scrypta-login/
