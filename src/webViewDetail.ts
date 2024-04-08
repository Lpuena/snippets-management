/* eslint-disable no-console */
// WebViewDetail.ts
import * as vscode from 'vscode'
import { readFileContent } from './readFile'
import { fileRegex, replacePrefixValue, replaceScopeValue, replaceTemplateNameValue } from './fileRegex'

export class WebViewDetail {
  private _extensionUri: vscode.Uri
  private fileContent: string
  constructor(fileName: string, extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri
    this.createNewWebviewPanel(fileName)
    this.fileContent = readFileContent(fileName)
  }

  private createNewWebviewPanel(fileName: string) {
    const panel = vscode.window.createWebviewPanel(
      'newWebview', // 唯一标识符
      'New Webview', // 面板标题
      vscode.ViewColumn.Beside, // 在编辑器的哪个部分打开
      {
        enableScripts: true,
      },
    )

    // 根据文件名加载对应内容
    panel.webview.html = this.getNewWebviewContent(fileName, panel.webview)

    // 在这里添加针对新Webview面板的消息处理逻辑
    panel.webview.onDidReceiveMessage((message) => {
      console.log('Received message:', message)
      let newFileContent = ''

      if (message.command === 'scopeChanged') {
        console.log('Scope changed:', message.scope)
        // 处理scope变化的相关逻辑
        // 在这里添加针对输入框修改的逻辑
        newFileContent = replaceScopeValue(this.fileContent, message.scope)
      }

      if (message.command === 'prefixChanged') {
        console.log('Prefix changed:', message.prefix)
        // 处理prefix变化的相关逻辑
        newFileContent = replacePrefixValue(this.fileContent, message.prefix)
      }

      if (message.command === 'templateNameChanged') {
        console.log('templateName changed:', message.templateName)
        // 处理prefix变化的相关逻辑
        newFileContent = replaceTemplateNameValue(this.fileContent, message.templateName)
      }

      this.fileContent = newFileContent
      console.log('New file content:', newFileContent)
      panel.webview.postMessage({
        command: 'updateFileContent',
        content: newFileContent,
      })
    })
  }

  private getNewWebviewContent(fileName: string, webview: vscode.Webview) {
    this.fileContent = readFileContent(fileName)
    const { scope, prefix, templateName } = fileRegex(this.fileContent)
    console.log('templateName:', templateName)

    const scriptPath = webview.asWebviewUri(vscode.Uri.joinPath(
      this._extensionUri,
      'src',
      'htmlScript',
      'webviewScript.js',
    ))

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Details</title>
      <style>
        #fileContent {
          width: 100%;
          height: 300px;
        }
      </style>
    </head>
    <body>
      <h1>File Details for ${fileName}</h1>
      <h2>Edit Scope and Prefix</h2>
      <div>
        <label for="templateName">Template Name:</label>
        <input type="text" id="templateNameInput" value="${templateName}" />
        <label for="scopeInput">Scope:</label>
        <input type="text" id="scopeInput" value="${scope}" />
        <label for="prefixInput">Prefix:</label>
        <input type="text" id="prefixInput" value="${prefix}" />
      </div>
      <textarea id="fileContent" disabled>${this.fileContent}</textarea>
      <script src="${scriptPath}"></script>
    </body>
    </html>
    `
  }
}
