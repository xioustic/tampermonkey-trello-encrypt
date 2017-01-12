// ==UserScript==
// @name        Trello Encrypt via XHR Hijack
// @namespace   https://xioustic.com/
// @description Greasemonkey script for encrypting data in Trello by hijacking XHR requests and responses.
// @include     http://trello.com/*
// @include     https://trello.com/*
// @require     https://github.com/xioustic/tampermonkey-trello-encrypt/raw/master/rollups_aes.js
// @require     https://github.com/xioustic/tampermonkey-trello-encrypt/raw/master/xhook_gm.js
// @downloadURL https://github.com/xioustic/tampermonkey-trello-encrypt/raw/dev/trello_encrypt.user.js
// @license     MIT
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     v0.0.2
// @nocompat Chrome
// ==/UserScript==

/*
 * Copyright (c) 2016 Xioustic
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// ESLINT:
/* global xhook, GM_getValue, GM_setValue, prompt */
/* global GM_registerMenuCommand, confirm */

// Unpack Settings
// primary password for encrypting / decrypting
var password = GM_getValue('cryptojs.aes.password', null)

// alternate keys to be used if main password cannot decrypt
var altPasswords = JSON.parse(GM_getValue('cryptojs.aes.altpasswords', '[]'))

// changing settings helper methods
var setNewPassword = function (newPass) {
  var oldPass = password
  GM_setValue('cryptojs.aes.password', newPass)
  password = newPass
  addAltPassword(oldPass)
}

var addAltPassword = function (altPass) {
  if (altPass === '' || altPass === null) return
  altPasswords.push(altPass)
  GM_setValue('cryptojs.aes.altpasswords', JSON.stringify(altPasswords))
}

var requestPassword = function requestPassword () {
  var newPass = prompt('Please type your Trello Encryption password:')
  // blank passwords disable encryption
  if (newPass === '') {
    // make sure they know what's going on...
    if (confirm('WARNING: A blank password will disable encryption!\nAre you sure you want to do this?')) return setNewPassword(newPass)
    // otherwise let's start over
    else return requestPassword()
  } else {
    // this is a normal password, just set it
    return setNewPassword(newPass)
  }
}

// menu items and methods
GM_registerMenuCommand('TrelloCrypt: Set Password', requestPassword, 'p')

// ensure we have a password before continuing
if (password === null) requestPassword()

xhook.before(function (req) {
  console.log('before')
  console.log(req)
})

xhook.after(function (req, res) {
  console.log('after')
  console.log(req)
  console.log(res)
})
