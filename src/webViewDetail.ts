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
export const FILE_NAME = new ReactiveData<string>('')

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
    console.log('创建新的Webview面板:', fileName)
    FILE_NAME.value = fileName

    const panel = vscode.window.createWebviewPanel(
      'newWebview', // 唯一标识符
      FILE_NAME.value, // 面板标题
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
      <h1>File Details for ${FILE_NAME.value}</h1>
      <h4>
       Place your 全局 snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and 
       description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope 
       is left empty or omitted, the snippet gets applied to all languages. The prefix is what is 
       used to trigger the snippet and the body will be expanded and inserted. Possible variables are: 
       $1, $2 for tab stops, $0 for the final cursor position, and \${1:label}\,\${2:another}\ for placeholders. 
       Placeholders with the same ids are connected.
      </h4>
      <h4>
      将您的全局代码片段放在这里。 每个片段都在片段名称下定义，并具有范围、前缀、正文和描述。 
      在范围字段中添加代码段适用的语言的逗号分隔 ID。 如果范围留空或省略，则该代码片段将应用于所有语言。
      前缀用于触发代码片段，正文将被展开和插入。 
      可能的变量有：$1、$2 表示制表位，$0 表示最终光标位置，\${1:label}\,\${2:another}\ 表示占位符。 具有相同 id 的占位符是相连的。
      </h4>
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
