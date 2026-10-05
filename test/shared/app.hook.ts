import { browser } from '@wdio/globals'

export async function restartApplication(context: Mocha.Context) {
  void context
  // Reload through Electron: ChromeDriver's file-page navigation can hang while
  // the renderer has active client requests, even after the page has reloaded.
  await browser.electron.execute(async (electron) => {
    const window = electron.BrowserWindow.getAllWindows().find(window => window.getTitle() !== 'Context Menu')
    if (!window) throw new Error('No application window to reload')
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Application reload did not finish')), 30_000)
      window.webContents.once('did-finish-load', () => {
        clearTimeout(timer)
        resolve()
      })
      window.reload()
    })
  })
}
