import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'

function getSnippetsDir() {
  let snippetsDir
  switch (os.platform()) {
    case 'win32':
      snippetsDir = path.join(os.homedir(), 'AppData/Roaming/Code/User/snippets')
      break
    case 'darwin':
      snippetsDir = path.join(os.homedir(), 'Library/Application Support/Code/User/snippets')
      break
    case 'linux':
      snippetsDir = path.join(os.homedir(), '.config/Code/User/snippets')
      break
    default:
      throw new Error(`Unsupported platform: ${os.platform()}`)
  }
  return snippetsDir
}

export function readFile() {
  const snippetsDir = getSnippetsDir()
  const files = fs.readdirSync(snippetsDir)
  return files
}

export function readFileContent(fileName: string) {
  const snippetsDir = getSnippetsDir()
  const filePath = path.join(snippetsDir, fileName)
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  return fileContent
}
