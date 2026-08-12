const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('afa', {
  isElectron: true,
  /** 'desk' (onboarding) | 'mobile' (live app) */
  setMode: (mode) => ipcRenderer.invoke('afa:mode', mode),
  hide: () => ipcRenderer.invoke('afa:hide'),
  quit: () => ipcRenderer.invoke('afa:quit'),
  openDevtools: () => ipcRenderer.invoke('afa:openDevtools'),
  /** Tray-menu driven demo triggers: 'request' | 'vision' | 'reset' */
  onTrigger: (cb) => {
    const handler = (_e, name) => cb(name)
    ipcRenderer.on('afa:trigger', handler)
    return () => ipcRenderer.removeListener('afa:trigger', handler)
  },
})
