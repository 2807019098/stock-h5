/**
 * 插入`style`标签
 */
export function appendStyle(css: string, id: string, replace = true) {
  let style = document.getElementById(id);
  if (style && replace) {
    document.head.removeChild(style);
    style = null;
  }

  if (!style) {
    const el = document.createElement('style');
    el.type = 'text/css';
    el.id = id;
    el.textContent = css;

    document.head.appendChild(el);
  }
}
