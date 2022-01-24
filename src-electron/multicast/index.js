import { BrowserWindow } from 'electron'
import dgram from 'dgram'
import db from '../db'

import { checkPowerOff, sendNic } from '../functions'

let multicast
const maddr = '230.185.192.109'
const server_port = 56434
const client_port = 52319

function createMulticast() {
  return new Promise((resolve, reject) => {
    try {
      const timer = setTimeout(() => {
        reject(null, 'connect timeout')
      }, 5000)
      multicast = dgram.createSocket('udp4')
      multicast.bind(server_port, () => {
        multicast.setBroadcast(true)
        multicast.setMulticastTTL(128)
        multicast.addMembership(maddr)
        clearTimeout(timer)

        multicast.on('message', (message) => {
          parse(message)
        })

        resolve(multicast)
      })
    } catch (e) {
      reject(null, e)
    }
  })
}

async function parse(args) {
  try {
    const message = JSON.parse(args)
    console.log(message)
    switch (message.command) {
      case 'sync':
        BrowserWindow.fromId(1).webContents.send('onResponse', {
          command: 'sync'
        })
        sendNic()
        break
      case 'off':
        checkPowerOff(message.value)
        break
      default:
        console.log('recv= ', message)
        break
    }
  } catch (e) {
    console.error(e)
  }
}

function multicastSend(message) {
  try {
    multicast.send(JSON.stringify(message), client_port, maddr)
  } catch (e) {
    console.error('Multicast send error ', e)
  }
}

export { multicast, createMulticast, multicastSend }
