const {
  app, BrowserWindow, Tray, Menu, nativeImage,
  ipcMain, globalShortcut, screen, shell,
} = require('electron')
const path = require('path')

const isDev = !!process.env.AFA_DEV
const DEV_URL = 'http://localhost:5173'

/**
 * Two window personalities.
 *  - `desk`   : onboarding. A normal, centred desktop window.
 *  - `mobile` : the live app. Phone-shaped, parked under the menu-bar icon.
 * Everything from ACTIVATING onward runs in `mobile`.
 */
const MODES = {
  desk: { width: 1120, height: 760 },
  mobile: { width: 400, height: 820 },
}

let win = null
let tray = null
let mode = 'desk'
let quitting = false

// ---------------------------------------------------------------- geometry

function boundsFor(nextMode) {
  const { width, height } = MODES[nextMode]
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const wa = display.workArea

  if (nextMode === 'desk') {
    return {
      width,
      height,
      x: Math.round(wa.x + (wa.width - width) / 2),
      y: Math.round(wa.y + (wa.height - height) / 2),
    }
  }

  // Mobile hangs off the tray icon when we know where it is, otherwise the
  // top-right corner of the work area.
  const margin = 12
  let x = wa.x + wa.width - width - margin
  if (tray) {
    const t = tray.getBounds()
    if (t.width) x = Math.round(t.x + t.width / 2 - width / 2)
  }
  x = Math.max(wa.x + margin, Math.min(x, wa.x + wa.width - width - margin))
  const y = Math.min(wa.y + margin, wa.y + wa.height - height - margin)
  return { width, height, x, y: Math.max(wa.y + margin, y) }
}

let clampTimer = null

function applyMode(nextMode, animate = true) {
  if (!win || !MODES[nextMode]) return
  mode = nextMode
  const { width, height } = MODES[nextMode]
  const b = boundsFor(nextMode)
  const smooth = animate && process.platform === 'darwin'

  // Release the size clamp before resizing. Tightening min/max first would
  // snap the window to the new size instantly and eat the animation.
  if (clampTimer) clearTimeout(clampTimer)
  win.setMinimumSize(1, 1)
  win.setMaximumSize(10000, 10000)

  // `true` gives a native animated resize on macOS — this is what makes the
  // desktop HUD visibly collapse into a phone during the Activate beat.
  win.setBounds(b, smooth)

  // Re-clamp once the animation settles, so the frameless window can't be
  // dragged out of shape mid-demo.
  clampTimer = setTimeout(() => {
    if (!win || win.isDestroyed()) return
    win.setMinimumSize(width, height)
    win.setMaximumSize(width, height)
  }, smooth ? 450 : 0)
}

// ---------------------------------------------------------------- window

function createWindow() {
  const b = boundsFor('desk')
  win = new BrowserWindow({
    ...b,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    // No titleBarStyle override: we draw our own controls, and
    // `customButtonsOnHover` would float native traffic lights over them.
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })

  win.setAlwaysOnTop(true, 'floating')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (isDev) win.loadURL(DEV_URL)
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  win.once('ready-to-show', () => showWindow())

  win.on('close', (e) => {
    // Closing the window just tucks the app back into the menu bar.
    if (!quitting) {
      e.preventDefault()
      hideWindow()
    }
  })

  // Never navigate away; open real links in the user's browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

function showWindow() {
  if (!win) return
  applyMode(mode, false)
  win.show()
  win.focus()
  app.focus({ steal: true })
}

function hideWindow() {
  if (win && win.isVisible()) win.hide()
}

function toggleWindow() {
  if (!win) return createWindow()
  win.isVisible() ? hideWindow() : showWindow()
}

// ---------------------------------------------------------------- tray

function createTray() {
  // dist/ exists after a build; public/ is the source-run fallback.
  let image = nativeImage.createFromPath(
    path.join(__dirname, '..', 'dist', 'assets', 'logo-mark.png')
  )
  if (image.isEmpty()) {
    image = nativeImage.createFromPath(
      path.join(__dirname, '..', 'public', 'assets', 'logo-mark.png')
    )
  }
  if (image.isEmpty()) {
    // 1x1 transparent fallback so the app still launches without the asset.
    image = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    )
  }
  tray = new Tray(image.resize({ width: 18, height: 18 }))
  tray.setToolTip('AI for All — turn what your computer has into AI access for everyone.')

  tray.on('click', toggleWindow)
  tray.on('right-click', () => {
    tray.popUpContextMenu(
      Menu.buildFromTemplate([
        { label: 'Show AI for All', accelerator: 'Cmd+Shift+A', click: showWindow },
        { type: 'separator' },
        { label: 'Trigger incoming request', click: () => send('request') },
        { label: 'Play scale vision', click: () => send('vision') },
        { label: 'Reset demo', click: () => send('reset') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Cmd+Q', click: () => { quitting = true; app.quit() } },
      ])
    )
  })
}

function send(name) {
  showWindow()
  if (win) win.webContents.send('afa:trigger', name)
}

// ---------------------------------------------------------------- ipc

ipcMain.handle('afa:mode', (_e, next) => { applyMode(next); return next })
ipcMain.handle('afa:hide', () => hideWindow())
ipcMain.handle('afa:quit', () => { quitting = true; app.quit() })
ipcMain.handle('afa:openDevtools', () => win && win.webContents.openDevTools({ mode: 'detach' }))

// ---------------------------------------------------------------- lifecycle

// Menu-bar-only app: no dock icon, no app switcher entry. This is the
// "sits on the device discreetly" part of the brief.
if (process.platform === 'darwin' && app.dock) app.dock.hide()

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', showWindow)

  app.whenReady().then(() => {
    createTray()
    createWindow()
    globalShortcut.register('CommandOrControl+Shift+A', toggleWindow)
  })

  app.on('activate', showWindow)
  // Closing is intercepted in win.on('close'), so the window is only ever
  // hidden — but keep the handler so the app never auto-quits on any platform.
  app.on('window-all-closed', () => {})
  app.on('before-quit', () => { quitting = true })
  app.on('will-quit', () => globalShortcut.unregisterAll())
}
