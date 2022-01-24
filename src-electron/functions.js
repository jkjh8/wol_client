import { BrowserWindow } from 'electron'
import * as shutdown from 'electron-shutdown-command'
import db from './db'

import { getNicsAndSend } from './nics'
import { multicastSend } from './multicast'

const maddr = '230.185.192.109'
const client_port = 52319

async function getSetup() {
  try {
    const r = await db.setup.find({})
    BrowserWindow.fromId(1).webContents.send('onResponse', {
      command: 'setup',
      value: r
    })
  } catch (e) {
    console.error(e)
  }
}

async function checkPowerOff(nics) {
  try {
    let r = await db.setup.findOne({ section: 'network' })
    nics.forEach(async (mac) => {
      console.log(mac, r)
      if (r.value === mac) {
        let rt = await db.setup.findOne({ section: 'block' })
        if (rt.value) return null

        rt = await db.setup.findOne({ section: 'checkPowerOff' })
        if (rt.value) {
          BrowserWindow.fromId(1).show()
          return BrowserWindow.fromId(1).webContents.send(
            'onResponse',
            {
              command: 'checkpower'
            }
          )
        }
        shutdown.shutdown({ force: true })
      }
    })
  } catch (e) {
    console.error(e)
  }
}

async function sync() {
  try {
    BrowserWindow.fromId(1).webContents.send('onResponse', {
      command: 'sync'
    })
    await sendNic()
  } catch (e) {
    console.error(e)
  }
}

async function sendNic() {
  try {
    console.log('sendnic')
    const nics = getNicsAndSend()
    const nic = await db.setup.findOne({ section: 'network' })
    const block = await db.setup.findOne({ section: 'block' })
    nics.forEach((item) => {
      if (item.mac === nic.value) {
        multicastSend({
          command: 'nic',
          value: { ...item, block: block.value }
        })
      }
    })
  } catch (e) {
    console.error(e)
  }
}

export { getSetup, checkPowerOff, sync, sendNic }
