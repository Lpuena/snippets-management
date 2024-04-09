import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'
import { showInfoMessage, showWarningMessage } from './util/vscodeUtil'

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

export function saveFileContent(fileName: string, content: string) {
  const snippetsDir = getSnippetsDir()
  const filePath = path.join(snippetsDir, fileName)
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    // 文件保存成功
    showInfoMessage(`${fileName},保存成功`)
  }
  catch (error) {
    // 文件保存失败
    console.error('保存文件时出现错误：', error)
    showWarningMessage(`保存${fileName}失败，请检查文件路径是否正确`)
  }
}
