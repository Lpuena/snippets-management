/* eslint-disable no-console */
/** 文件正则表达式匹配器 */
const scopeRegex = /"scope"\s*:\s*"(.*?)"\s*,/
const prefixRegex = /"prefix"\s*:\s*"([^"]+)"/
const templateNameRegex = /"([^"]+)"(\s*:\s*{)/
const bodyRegex = /"body":\s*(\[[\s\S]*?\]),/

export function fileRegex(file: string) {
  const prefixMatch = file.match(prefixRegex)
  const scopeMatch = file.match(scopeRegex)
  const templateNameMatch = file.match(templateNameRegex)
  const bodyMatch = file.match(bodyRegex)

  let bodyMatchFormat = ''
  let code = ''

  console.log('scopeMatch', scopeMatch)

  if (scopeMatch)
    console.log('!!!', scopeMatch[1])
  if (prefixMatch)
    console.log(prefixMatch[1])
  if (templateNameMatch)
    console.log(templateNameMatch[1])
  if (bodyMatch) {
    // console.log('body', bodyMatch[1])
    bodyMatchFormat = formatSnippet(bodyMatch[1])
    code = formatToCode(bodyMatchFormat)
  }

  return {
    scope: scopeMatch && scopeMatch[1] || '',
    prefix: prefixMatch && prefixMatch[1] || '',
    templateName: templateNameMatch && templateNameMatch[1] || '',
    body: bodyMatchFormat,
    code,
  }
}

export function replaceScopeValue(jsonString: string, newVal: string) {
  return jsonString.replace(scopeRegex, `"scope": "${newVal}",`)
}
export function replacePrefixValue(jsonString: string, newVal: string) {
  return jsonString.replace(prefixRegex, `"prefix": "${newVal}"`)
}
export function replaceTemplateNameValue(jsonString: string, newVal: string) {
  return jsonString.replace(templateNameRegex, `"${newVal}"$2`)
}

export function replaceBodyValue(jsonString: string, newVal: string) {
  return jsonString.replace(bodyRegex, `"body": ${newVal},`)
}

/** 转换成对齐格式 */
function formatSnippet(snippet: string) {
  // 转换旧的缩进格式，以统一的缩进重新格式化字符串
  const lines = snippet.split('\n') // 按行分割文本
  const filteredLines = lines.map((line) => {
    // 处理除第一行和最后一行以外的所有行
    if (line.trim() !== '[' && line.trim() !== ']')
      return `  ${line.trim()}` // 给除去首尾空白后的行加两个空格的缩进
    else
      return line.trim() // 对于第一行和最后一行，只移除首尾空白
  })
  // 去除首尾的空白行，然后将处理过的行重新组合成一个字符串
  const formattedSnippet = filteredLines.filter(line => line.length > 0).join('\n')
  return formattedSnippet
}

/** 将格式化后的字符串变成代码格式 */
function formatToCode(code: string): string {
  // 去除数组开头和结尾的括号字符以及额外的空格和换行符
  const trimmedArrayString = code.trim().slice(1, -1).trim()

  // 去除每行的引号和逗号，同时将转义的双引号还原为普通双引号
  const htmlTemplate = trimmedArrayString
    .split('\",\n') // 分割每一项
    .map(line => line.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"')) // 去除引号并处理转义字符
    .join('\n').replace(/\\n/g, '\n') // 将转义的换行符还原为真实的换行符

  // 返回处理后的HTML模板字符串
  return htmlTemplate
}

export function codeToSnippetFormat(code: string): string {
  console.log('code参数', code)
  let lines = code.split('\n')

  const array = lines.reduce<string[]>((acc, line, index) => {
    if (line.trim() !== '') {
      acc.push(line)
    }
    else {
      // 如果当前行是空行，且上一行存在且非空，将换行符添加到上一行结束，然后删除当前空行
      if (acc[acc.length - 1] && acc[acc.length - 1].trim() !== '') {
        acc[acc.length - 1] += '\n'
        lines = lines.slice(0, index).concat(lines.slice(index + 1))
      }
      else {
        // 如果上一行不存在或者也是空行，直接添加到数组
        acc.push(line)
      }
    }

    return acc
  }, [])

  console.log('!!!btn转换', array)

  // 将数组转换为格式化的字符串
  return JSON.stringify(array, null, 2)
}
