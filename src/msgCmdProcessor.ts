/* eslint-disable no-console */
import { assign, parse, stringify } from 'comment-json'
import { codeToSnippetFormat, fileRegex, replaceBodyValue, replacePrefixValue, replaceScopeValue, replaceTemplateNameValue } from './fileRegex'
import { BODY, CODE, FILE_CONTENT, FILE_NAME, SCOPE } from './webViewDetail'
import { saveFileContent } from './readFile'
import { showInfoMessage } from './util/vscodeUtil'

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

function handleScopeChange(fileContent: string, message: ReceivedMessage): string {
  console.log('Scope changed:', message.scope)
  SCOPE.value = message.scope
  return replaceScopeValue(fileContent, message.scope)
}

function handlePrefixChange(fileContent: string, message: ReceivedMessage): string {
  console.log('Prefix changed:', message.prefix)
  return replacePrefixValue(fileContent, message.prefix)
}

function handleTemplateNameChange(fileContent: string, message: ReceivedMessage): string {
  console.log('templateName changed:', message.templateName)
  return replaceTemplateNameValue(fileContent, message.templateName)
}

function handleCodeAreaChange(fileContent: string, message: ReceivedMessage): string {
  console.log('codeArea changed:', message.codeArea)
  CODE.value = message.codeArea
  coverStatus = true
  return fileContent
}
/** 代码转换按钮点击事件 */
function handleConvertButtonClick(fileContent: string, message: ReceivedMessage, postMessage: PostMessage): string {
  console.log('convertBtnClicked')
  if (!coverStatus) {
    console.warn('没有更改,无需转换')
    showInfoMessage('没有更改,无需转换')
    return fileContent
  }
  const newSnippet = codeToSnippetFormat(CODE.value)
  BODY.value = newSnippet
  postMessage({
    command: 'updateBody',
    content: BODY.value,
  })
  const beforeFormatContent = replaceBodyValue(fileContent, BODY.value)
  const formatContent = parse(beforeFormatContent)
  return stringify(formatContent, null, 2)
}
/** 保存按钮点击事件 */
function handleSaveButtonClick(fileContent: string, _message: ReceivedMessage): string {
  console.log('saveBtnClicked')
  saveFileContent(FILE_NAME.value, FILE_CONTENT.value)
  return fileContent
}

const commandHandlers = new Map<string, (fileContent: string, message: ReceivedMessage, postMessage: PostMessage) => string>([
  ['scopeChanged', handleScopeChange],
  ['prefixChanged', handlePrefixChange],
  ['templateNameChanged', handleTemplateNameChange],
  ['codeAreaChanged', handleCodeAreaChange],
  ['convertBtnClicked', handleConvertButtonClick],
  ['saveBtnClicked', handleSaveButtonClick],
])

export function handleMessage(fileContent: string, message: ReceivedMessage, postMessage: PostMessage) {
  const handler = commandHandlers.get(message.command)

  if (!handler) {
    console.warn('Unknown command:', message.command)
    return fileContent // 无需更新
  }

  const newFileContent = handler(fileContent, message, postMessage)

  if (newFileContent && newFileContent !== fileContent) {
    postMessage({
      command: 'updateFileContent',
      content: newFileContent,
    })
  }

  return newFileContent || fileContent
}
