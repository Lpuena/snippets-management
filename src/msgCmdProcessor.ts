/* eslint-disable no-console */
import { codeToSnippetFormat, fileRegex, replacePrefixValue, replaceScopeValue, replaceTemplateNameValue } from './fileRegex'

interface Message {
  command: string
  content: string

}
type ReceivedMessage = Message & {
  scope: string
  prefix: string
  templateName: string
  codeArea: string
}
type PostMessage = (message: Message) => void
let newCode = ''
export function handleMessage(fileContent: string, message: ReceivedMessage, postMessage: PostMessage) {
  let newFileContent = ''

  let newSnippet = ''

  switch (message.command) {
    case 'scopeChanged':
      console.log('Scope changed:', message.scope)
      newFileContent = replaceScopeValue(fileContent, message.scope)
      console.log('New file content:', newFileContent)
      break

    case 'prefixChanged':
      console.log('Prefix changed:', message.prefix)
      newFileContent = replacePrefixValue(fileContent, message.prefix)
      console.log('New file content:', newFileContent)
      break

    case 'templateNameChanged':
      console.log('templateName changed:', message.templateName)
      newFileContent = replaceTemplateNameValue(fileContent, message.templateName)
      break

    case 'codeAreaChanged':
      console.log('newCode1', newCode)

      console.log('codeArea changed:', message.codeArea)
      newCode = message.codeArea
      console.log('newCode2', newCode)
      // 实现codeArea变化的相关逻辑
      break

    case 'convertBtnClicked':
      console.log('convertBtnClicked')
      if (!newCode) {
        console.warn('没有更改,无需转换')
        return fileContent // 无需更新
      }
      newSnippet = codeToSnippetFormat(newCode)
      console.log('newSnippet', newSnippet)
      break

    default:
      console.warn('Unknown command:', message.command)
      return fileContent // 无需更新
  }

  // 如果内容有变化，向webview发送更新命令
  if (newFileContent && newFileContent !== fileContent) {
    postMessage({
      command: 'updateFileContent',
      content: newFileContent,
    })
  }

  return newFileContent
}
