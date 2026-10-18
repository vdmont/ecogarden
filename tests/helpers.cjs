/**
 * 测试用小工具：按源码原文做检查时，先把排版差异去掉。
 *
 * 背景：有些检查是要确认「某段实现确实写在那里」，于是直接用字符串去源文件里找。
 * 这种写法一旦改排版（换行、缩进、= 号两侧空格）就会误报失败，
 * 而排版变化本来跟它要检查的事情毫无关系。
 *
 * 用法：
 *   const compact = require('./helpers.cjs').compactSource;
 *   assert(compact(app).includes(compact('const paused=document.hidden||!!x;')));
 *
 * 注意：只压缩空白，不改动任何其他字符，所以检查的严格程度不会降低。
 */
function compactSource(text) {
  return String(text).replace(/\s+/g, '');
}
module.exports = { compactSource };
