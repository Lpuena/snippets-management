import * as vscode from 'vscode'
import { readFile, readFileContent } from './readFile'

export class MyWebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView
  private _extensionUri: vscode.Uri

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView
    webviewView.webview.options = { enableScripts: true }
    webviewView.webview.html = this.getWebviewContent(readFile())
    webviewView.webview.onDidReceiveMessage((message) => {
      // 处理来自webview的消息
      if (message.command === 'fileClicked') {
        // eslint-disable-next-line no-console
        console.log('File clicked:', message.fileName)
        // 创建新的webview面板，并加载相应内容
        this.createNewWebviewPanel(message.fileName)
      }
    })
  }

  private getWebviewContent(fileContent: string[]) {
    const styleUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'styles', 'main.css'),
    )

    const fileList = fileContent.map((file) => {
      return `<div class="file" data-file="${file}">${file}</div>`
    }).join('')

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Snippet Management</title>
      </head>
      <body>
        <h1>Snippet Management!</h1>
        <div class="container">
          ${fileList}
        </div>
        <script>
          // 添加点击事件处理逻辑
          const vscode = acquireVsCodeApi();
          document.querySelectorAll('.file').forEach(element => {
            element.addEventListener('click', () => {
              const file = element.getAttribute('data-file');
              // 向插件发送消息，通知文件被点击
              vscode.postMessage({
                command: 'fileClicked',
                fileName: file
              });
            });
          });
        </script>
      </body>
      </html>
    `
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
    panel.webview.html = this.getNewWebviewContent(fileName)
  }

  private getNewWebviewContent(fileName: string) {
    // 读取文件内容
    const fileContent = readFileContent(fileName)
    // 生成Webview页面的HTML
    return this.generateWebviewHtml(fileName, fileContent)
  }

  private generateWebviewHtml(fileName: string, fileContent: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File Details</title>
        <style>
        /* 添加样式 */
        #fileContent {
          width: 100%;
          background-color: #222222; /* 设置背景色 */
          color: #c98a7d; /* 设置字体颜色 */
          height: 500px; /* 设置文本框高度 */
          font-size: 14px; /* 设置字体大小 */
          padding: 10px; /* 设置内边距 */
          box-sizing: border-box; /* 让内边距和边框计入高度和宽度 */
          border: 1px solid #ccc; /* 设置边框 */
          border-radius: 5px; /* 设置圆角 */
        }
      </style>
      </head>
      <body>
        <h1>File Details for ${fileName}</h1>
        <textarea id="fileContent">${fileContent}</textarea>
      </body>
      </html>
    `
  }
}
