/* eslint-disable no-console */

import { assign, parse, stringify } from 'comment-json'
import { codeToSnippetFormat, fileRegex, replaceBodyValue, replacePrefixValue, replaceScopeValue, replaceTemplateNameValue } from './fileRegex'
import { BODY, CODE, FILE_CONTENT, SCOPE } from './webViewDetail'

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

let coverStatus = false
export function handleMessage(fileContent: string, message: ReceivedMessage, postMessage: PostMessage) {
  let newFileContent = ''

  let newSnippet = ''
  let beforeFormatContent = ''
  let formatContent: any = ''

  switch (message.command) {
    case 'scopeChanged':
      console.log('Scope changed:', message.scope)
      newFileContent = replaceScopeValue(fileContent, message.scope)
      // 改变响应式的scope
      SCOPE.value = message.scope

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
      console.log('codeArea changed:', message.codeArea)
      CODE.value = message.codeArea
      coverStatus = true

      console.log('CODE.value', CODE.value)
      // 实现codeArea变化的相关逻辑
      break

    case 'convertBtnClicked':
      console.log('convertBtnClicked')
      if (!coverStatus) {
        console.warn('没有更改,无需转换')
        return fileContent // 无需更新
      }
      newSnippet = codeToSnippetFormat(CODE.value)
      BODY.value = newSnippet
      console.log('BODY.value', BODY.value)
      postMessage({
        command: 'updateBody',
        content: BODY.value,
      })
      beforeFormatContent = replaceBodyValue(fileContent, BODY.value)
      formatContent = parse(beforeFormatContent)
      newFileContent = stringify(formatContent, null, 4) // 4: 表示缩进4个空格
      console.log('New file content:', newFileContent)

      break

    case 'saveBtnClicked':
      console.log('saveBtnClicked')
      // TODO 保存文件
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

  return newFileContent || FILE_CONTENT.value
}
