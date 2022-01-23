import { BrowserWindow } from 'electron'
import dgram from 'dgram'
import db from '../db'

import * as shutdown from 'electron-shutdown-command'

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
          console.log(message)
        })

        resolve(multicast)
      })
    } catch (e) {
      reject(null, e)
    }
  })
}

export { multicast, createMulticast }
