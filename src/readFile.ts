import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as vscode from 'vscode'

export function readFile() {
  let snippetsDir
  switch (os.platform()) {
    case 'win32':
      // Windows 平台
      snippetsDir = path.join(os.homedir(), 'AppData/Roaming/Code/User/snippets')
      break
    case 'darwin':
      // macOS 平台
      snippetsDir = path.join(os.homedir(), 'Library/Application Support/Code/User/snippets')
      break
    case 'linux':
      // Linux 平台
      snippetsDir = path.join(os.homedir(), '.config/Code/User/snippets')
      break
    default:
      throw new Error(`Unsupported platform:${os.platform()}`)
  }

  // 读取文件夹下的所有文件
  const files = fs.readdirSync(snippetsDir)
  files.forEach((file) => {
    // eslint-disable-next-line no-console
    console.log(file)
  })
  return files
}
