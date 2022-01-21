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
    const window = BrowserWindow.fromId(1)
    console.log(window)
    const nics = getNics()
    console.log(nics)
    window.webContents.send('onResponse', {
      command: 'nics',
      value: nics
    })
  } catch (e) {
    console.error(e)
  }
}

export { getNics, getNicsAndSend }
