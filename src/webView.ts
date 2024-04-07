// webView.ts
import type * as vscode from 'vscode'
import { readFile } from './readFile'

export class MyWebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView
    webviewView.webview.options = { enableScripts: true }
    this.updateWebview()
  }

  private updateWebview() {
    if (this._view) {
      const fileContent = readFile()
      this._view.webview.html = this.getWebviewContent(fileContent)
    }
  }

  private getWebviewContent(fileContent: string[]) {
    const fileList = fileContent.map(file => `<div>${file}</div>`).join('')
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Snippet Management</title>
      </head>
      <body>
          <h1>Snippet Management!</h1>
          <h3>${fileList}</h3>
      </body>
      </html>
      `
  }
}
