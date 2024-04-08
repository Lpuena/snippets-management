const vscode = acquireVsCodeApi()

// Message listener for file content update
window.addEventListener('message', (event) => {
  const message = event.data
  if (message.command === 'updateFileContent') {
    const newContent = message.content
    document.getElementById('fileContent').value = newContent
  }
  if (message.command === 'updateBody') {
    const newBody = message.content
    document.getElementById('bodyArea').value = newBody
  }
})

// // Input listeners for file content changes
// document.getElementById('fileContent').addEventListener('input', (event) => {
//   vscode.postMessage({
//     command: 'fileContentChanged',
//     newContent: event.target.value,
//   })
// })
// Add input listeners for scope changes
document.getElementById('scopeInput').addEventListener('input', (event) => {
  // 发送消息到插件，通知 scope 发生了变化
  vscode.postMessage({
    command: 'scopeChanged',
    scope: event.target.value,
  })
})

// Add input listeners for prefix changes
document.getElementById('prefixInput').addEventListener('input', (event) => {
  vscode.postMessage({
    command: 'prefixChanged',
    prefix: event.target.value,
  })
})

// Add input listeners for template name changes
document.getElementById('templateNameInput').addEventListener('input', (event) => {
  vscode.postMessage({
    command: 'templateNameChanged',
    templateName: event.target.value,
  })
})

// 增加code area 的监听
document.getElementById('codeArea').addEventListener('input', (event) => {
  vscode.postMessage({
    command: 'codeAreaChanged',
    codeArea: event.target.value,
  })
})

// 增加button 按钮的监听
document.getElementById('convertBtn').addEventListener('click', (_event) => {
  vscode.postMessage({
    command: 'convertBtnClicked',
  })
})
document.getElementById('saveBtn').addEventListener('click', (_event) => {
  vscode.postMessage({
    command: 'saveBtnClicked',
  })
})
