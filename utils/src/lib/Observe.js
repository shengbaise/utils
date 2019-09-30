import { isArray, isFunction } from './Type.js'
import { toArray } from './Array.js'

/**
 * 观察者
 */
class Observer {
  constructor () {
    this._events = Object.create(null)
  }
  /**
   * [$on 订阅]
   * @param  {(String|Array)}   event [事件别名]
   * @param  {Function|Array} fn    [事件回调]
   * @return {Object}         [this]
   */
  $on (event, fn) {
    let self = this
    if (isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        self.$on(event[i], fn)
      }
    } else if (isArray(fn)) {
      for (let i = 0; i < fn.length; i++) {
        self.$on(event, fn[i])
      }
    } else {
      (self._events[event] || (self._events[event] = [])).push(fn)
    }
    return self
  }
  /**
   * [$off 取消订阅]
   * @param  {(String|Array)}   event [description]
   * @param  {(Function|Array)} fn    [需要取消订阅的方法]
   * @return {Object}         [this]
   */
  $off (event, fn) {
    let self = this

    // 没有event清除所有事件
    if (!arguments.length) {
      self._events = Object.create(null)
      return self
    }
    // event是数组的话循环遍历
    if (isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        self.$off(event[i], fn)
      }
      return self
    }
    // 如果fn参数没有的话清空所有订阅
    if (fn === undefined) {
      this._events[event] = null
      return self
    }
    // 如果fn是方法数组的话
    if (isArray(fn)) {
      for (let i = 0; i < fn.length; i++) {
        self.$off(event, fn[i])
      }
      return self
    }
    // 第二个参数不是方法的时候
    if (!isFunction(fn)) {
      throw new TypeError('is not function')
      return self
    }
    let fns = self._events[event]
    // 不存在事件集时
    if (!fns) {
      return self
    }
    // 取消指定方法
    let cb
    let i = fns.length
    while (i--) {
      cb = fns[i]
      if (cb === fn || cb.fn === fn) {
        fns.splice(i, 1)
        break
      }
    }
    return self
  }
  /**
   * [$once 一次性订阅]
   * @param  {(String|Array)}   event [description]
   * @param  {Function} fn    [description]
   * @return {Object}         [this]
   */
  $once (event, fn) {
    const self = this
    function on () {
      self.$off(event, on)
      fn.apply(self, arguments)
    }
    self.$on(event, on)
    return self
  }
  /**
   * [$emit 触发订阅]
   * @param  {(String|Array)} event [description]
   * @return {Object}       [this]
   */
  $emit (event) {
    let self = this
    let fns = self._events[event]
    if (fns) {
      fns = fns.concat([])
      const args = toArray(arguments, 1)
      const l = fns.length >>> 0
      for (let i = 0; i < l; i++) {
        fns[i].apply(self, args)
      }
    }
    return self
  }
}

export default Observer
