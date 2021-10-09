/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { app, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('nic', {
  request: () => {
    ipcRenderer.send('getNetworkAddress')
  },
  onResponse: (fn) => {
    ipcRenderer.on('networkInterfaces', (event, ...args) => {
      fn(...args)
    })
  },
  set: (item) => {
    ipcRenderer.send('setNetworkInterface', item)
  },
  return: (fn) => {
    ipcRenderer.on('rtNetworkInterface', (event, ...args) => {
      fn(...args)
    })
  },
})

contextBridge.exposeInMainWorld('powerOff', {
  request: () => {
    ipcRenderer.send('powerOff')
  },
})

contextBridge.exposeInMainWorld('Fn', {
  set: (args) => {
    ipcRenderer.send('functionSet', args)
  },
})
