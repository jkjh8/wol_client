import { BrowserWindow } from 'electron'
import * as shutdown from 'electron-shutdown-command'
import db from './db'

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

export { getSetup, checkPowerOff }
