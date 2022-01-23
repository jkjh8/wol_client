import { BrowserWindow } from 'electron'
import dgram from 'dgram'
import db from '../db'

import { checkPowerOff } from '../functions'

let multicast

function createMulticast(port, maddr) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        reject(null, 'connect timeout')
      }, 5000)
      multicast = dgram.createSocket('udp4')
      multicast.bind(port, () => {
        multicast.setBroadcast(true)
        multicast.setMulticastTTL(128)
        multicast.addMembership(maddr)

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
    switch (message.command) {
      case 'sync':
        BrowserWindow.fromId(1).webContents.send('onResponse', {
          command: 'sync'
        })
        break
      case 'poweroff':
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

export { multicast, createMulticast }
