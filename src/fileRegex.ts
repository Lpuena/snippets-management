/* eslint-disable no-console */
/** 文件正则表达式匹配器 */
const scopeRegex = /"scope"\s*:\s*"(.*?)"\s*,/
const prefixRegex = /"prefix"\s*:\s*"([^"]+)"/
const templateNameRegex = /"([^"]+)"(\s*:\s*{)/

export function fileRegex(file: string) {
  const prefixMatch = file.match(prefixRegex)
  const scopeMatch = file.match(scopeRegex)
  const templateNameMatch = file.match(templateNameRegex)

  console.log('scopeMatch', scopeMatch)

  if (scopeMatch)
    console.log('!!!', scopeMatch[1])
  if (prefixMatch)
    console.log(prefixMatch[1])
  if (templateNameMatch)
    console.log(templateNameMatch[1])
  return {
    scope: scopeMatch && scopeMatch[1],
    prefix: prefixMatch && prefixMatch[1],
    templateName: templateNameMatch && templateNameMatch[1],
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
