import { BrowserWindow, ipcMain } from 'electron'
import * as shutdown from 'electron-shutdown-command'

import db from '../db'
import { multicast, multicastSend } from '../multicast'
import { getNicsAndSend } from '../nics'
import { getSetup, sendNic } from '../functions'

ipcMain.on('onRequest', async (e, args) => {
  const mainWindow = BrowserWindow.fromId(1)
  console.log('ipc ', args)
  try {
    switch (args.command) {
      case 'getnics':
        getNicsAndSend()
        break

      case 'signal':
        await db.setup.update(
          { section: 'signal' },
          { $set: { value: args.value } },
          { upsert: true }
        )
        break

      case 'block':
        await db.setup.update(
          { section: 'block' },
          { $set: { value: args.value } },
          { upsert: true }
        )
        break

      case 'poweroff':
        // only windows
        shutdown.shutdown({ force: true })
        break

      case 'getsetup':
        getSetup()
        sendNic()
        // multicast.send('setup', 12340, '230.123.123.123')
        break

      case 'selectnic':
        await db.setup.update(
          { section: 'network' },
          { $set: { value: args.value } },
          { upsert: true }
        )
        break

      case 'blockpoweroff':
        const nics = getNicsAndSend()
        const nic = await db.setup.findOne({ section: 'network' })
        nics.forEach((item) => {
          if (item.mac === nic) {
            multicast.send(
              JSON.stringify({
                command: 'blockpoweroff',
                nic: item
              })
            )
          }
        })
        break

      default:
        console.log(args)
        break
    }
  } catch (e) {
    console.error(e)
  }
})
