import * as vscode from 'vscode'
// 显示vscode通知
export function showInfoMessage(message: string) {
  vscode.window.showInformationMessage(message)
}

// 显示vscode警告
export function showWarningMessage(message: string) {
  vscode.window.showWarningMessage(message)
}
