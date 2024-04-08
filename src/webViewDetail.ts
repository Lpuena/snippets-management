/* eslint-disable no-console */
// WebViewDetail.ts
import * as vscode from 'vscode'
import { readFileContent } from './readFile'
import { fileRegex } from './fileRegex'
import { handleMessage } from './msgCmdProcessor'

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

      // 使用提取出来的逻辑进行处理
      const newFileContent = handleMessage(
        this.fileContent,
        message,
        (updatedContent: { command: string, content: string }) => {
          panel.webview.postMessage(updatedContent)
        },
      )
      // 更新本地文件内容
      if (newFileContent !== this.fileContent)
        this.fileContent = newFileContent
    })
  }

  private getNewWebviewContent(fileName: string, webview: vscode.Webview) {
    this.fileContent = readFileContent(fileName)
    const { scope, prefix, templateName, body, code } = fileRegex(this.fileContent)
    console.log('templateName:', templateName)

    const scriptPath = webview.asWebviewUri(vscode.Uri.joinPath(
      this._extensionUri,
      'src',
      'htmlScript',
      'webviewScript.js',
    ))
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'styles', 'detail.css'),
    )
    console.log('styleUri:', styleUri)
    console.log('scriptPath:', scriptPath)

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Details</title>
      
      </head>
      <link href="${styleUri}" rel="stylesheet">
    <body>
      <h1>File Details for ${fileName}</h1>
      <h2>Edit Scope and Prefix</h2>
      <div>
        <div class="input-group">
          <label for="templateName">Template Name:</label>
          <input type="text" id="templateNameInput" value="${templateName}" />
        </div>
        
        <div class="input-group">
          <label for="scopeInput">Scope(适用于的文件类型,逗号隔开):</label>
          <input type="text" id="scopeInput" value="${scope}" />
        </div>

        <div class="input-group">
          <label for="prefixInput">Prefix(激活代码片段的前缀):</label>
          <input type="text" id="prefixInput" value="${prefix}" />
        </div>

        <div class="area-group">
          <label>Code(源代码):</label>
          <button id="convertBtn">转换成代码片段</button>
          <textarea type="text" id="codeArea" >${code}</textarea>
        </div>
        
        <div class="area-group">
          <label>Body(代码片段内容):</label>
          <textarea type="text" id="bodyArea" >${body}</textarea>
        </div>
        
      </div>
      <textarea id="fileContent" disabled>${this.fileContent}</textarea>
      <script src="${scriptPath}"></script>
    </body>
    </html>
    `
  }
}
