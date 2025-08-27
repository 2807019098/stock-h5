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

/**
 * 平滑滚动元素到指定的垂直位置
 *
 * @param element - 需要滚动的元素
 * @param target - 目标滚动位置（scrollTop）
 * @param duration - 动画持续时间，单位毫秒，默认300ms
 * @returns Promise<void>
 */
export function smoothScrollTo(element: HTMLElement, target: number, duration = 300): Promise<void> {
  return new Promise((resolve) => {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();

    function animateScroll(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = start + change * progress;
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animateScroll);
  });
}