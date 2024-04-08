/* eslint-disable no-console */
// WebViewDetail.ts
import * as vscode from 'vscode'
import { readFileContent } from './readFile'
import { fileRegex } from './fileRegex'
import { handleMessage } from './msgCmdProcessor'
import { ReactiveData } from './reactiveData'

export const SCOPE = new ReactiveData<string>('')
export const PREFIX = new ReactiveData<string>('')
export const TEMPLATE_NAME = new ReactiveData<string>('')
export const BODY = new ReactiveData<string>('')
export const CODE = new ReactiveData<string>('')
export const FILE_CONTENT = new ReactiveData<string>('')
FILE_CONTENT.subscribe((value) => {
  console.log('FILE_CONTENT变化了:', value)
})

export class WebViewDetail {
  private _extensionUri: vscode.Uri
  constructor(fileName: string, extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri
    this.createNewWebviewPanel(fileName)
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
        FILE_CONTENT.value,
        message,
        (updatedContent: { command: string, content: string }) => {
          panel.webview.postMessage(updatedContent)
        },
      )
      // 更新本地文件内容
      if (newFileContent !== FILE_CONTENT.value) {
        console.log('更新的文件内容:', newFileContent)

        FILE_CONTENT.value = newFileContent
      }
    })
  }

  private getNewWebviewContent(fileName: string, webview: vscode.Webview) {
    FILE_CONTENT.value = readFileContent(fileName)
    const { scope, prefix, templateName, body, code } = fileRegex(FILE_CONTENT.value)

    SCOPE.value = scope
    PREFIX.value = prefix
    TEMPLATE_NAME.value = templateName
    BODY.value = body
    CODE.value = code
    console.log('SCOPE:', SCOPE.value)

    const scriptPath = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'src',
        'htmlScript',
        'webviewScript.js',
      ),
    )
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'styles',
        'detail.css',
      ),
    )
    // console.log('styleUri:', styleUri)
    // console.log('scriptPath:', scriptPath)

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
      <button id="saveBtn">Save Changes</button>
      <div>
        <div class="input-group">
          <label for="templateName">Template Name:</label>
          <input type="text" id="templateNameInput" value="${TEMPLATE_NAME.value}" />
        </div>
        
        <div class="input-group">
          <label for="scopeInput">Scope(适用于的文件类型,逗号隔开):</label>
          <input type="text" id="scopeInput" value="${SCOPE.value}" />
        </div>

        <div class="input-group">
          <label for="prefixInput">Prefix(激活代码片段的前缀):</label>
          <input type="text" id="prefixInput" value="${PREFIX.value}" />
        </div>

        <div class="area-group">
          <label>Code(源代码):</label>
          <button id="convertBtn">转换成代码片段</button>
          <textarea type="text" id="codeArea" >${CODE.value}</textarea>
        </div>
        
        <div class="area-group">
          <label>Body(代码片段内容):</label>
          <textarea type="text" id="bodyArea" >${BODY.value}</textarea>
        </div>
        
      </div>
      <textarea id="fileContent" disabled>${FILE_CONTENT.value}</textarea>
      <script src="${scriptPath}"></script>
    </body>
    </html>
    `
  }
}
