import { BrowserWindow } from 'electron'
import os from 'os'

function getNics() {
  try {
    const arr = []
    const nics = os.networkInterfaces()
    for (const [key, value] of Object.entries(nics)) {
      value.forEach((nic) => {
        if (!nic.internal && nic.family == 'IPv4') {
          arr.push({
            hostname: os.hostname(),
            name: key,
            address: nic.address,
            mac: nic.mac
          })
        }
      })
    }
    return arr
  } catch (e) {
    console.error(e)
  }
}

function getNicsAndSend() {
  try {
    const nics = getNics()
    BrowserWindow.fromId(1).webContents.send('onResponse', {
      command: 'nics',
      value: nics
    })
    return nics
  } catch (e) {
    console.error(e)
  }
}

export { getNics, getNicsAndSend }
