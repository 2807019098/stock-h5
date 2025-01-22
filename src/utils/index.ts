import { getBrowserInfo } from './web/getBrowserInfo'

const clientInfo = getBrowserInfo()

/**
 * 获取链接某个参数
 * @description 兼容search，hash并存情况
 * @param {string} key 参数名称
 * @param {string} [url]  链接
 * @returns {string} 返回参数值
 * @example
 * ```js
 * getQueryString('name'); // null
 * getQueryString('name', 'http://www.baidu.com?name=1&age=2'); // 1
 * ```
 */
export function getQueryString(key: string, url: string) {
  const reg = new RegExp(`([?&]+)${key}=([^&#]*)`)
  const href = url || window.location.href
  const results = href.substring(1).match(reg)

  if (!results) return null
  if (!results[2]) return ''

  return decodeURIComponent(results[2])
}

/**
 * 获取链接全部参数
 * @description 兼容search，hash并存情况
 * @param {string} [url]  链接
 * @returns {Record<string, string>} 返回包含当前URL参数的对象
 * @example
 * ```js
 * getURLParameters();
 *
 * getURLParameters('http://www.baidu.com?name=1&age=2#/demoPage?weight=3&o=4');
 * // => {name: "1", age: "2", weight: "3", o: "4"}
 * ```
 */
export function getURLParameters(url: string): Record<string, string> {
  const reg = /([^?=&]+)(=([^&#]*))/g
  const href = url || window.location.href
  const matchList = href.match(reg) || []
  const obj: Record<string, string> = {}

  matchList.forEach((v) => {
    obj[v.slice(0, v.indexOf('='))] = decodeURIComponent(v.slice(v.indexOf('=') + 1))
  })

  return obj
}

/**
 * 客户端信息
 */
export function getClientInfo() {
  return clientInfo
}

/**
 * 动态引入静态资源
 */
export function getAssetsUrl(name: string) {
  return new URL(`/src/assets/${name}`, import.meta.url).href
}
