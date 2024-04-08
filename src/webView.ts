// webView.ts
import * as vscode from 'vscode'
import { readFile, readFileContent } from './readFile'
import { WebViewDetail } from './webViewDetail'
import { fileRegex } from './fileRegex'

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
      if (message.command === 'fileClicked') {
        // eslint-disable-next-line no-console
        console.log('File clicked:', message.fileName)
        const _ = new WebViewDetail(message.fileName, this._extensionUri)
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
          const vscode = acquireVsCodeApi();
          document.querySelectorAll('.file').forEach(element => {
            element.addEventListener('click', () => {
              const file = element.getAttribute('data-file');
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
}
