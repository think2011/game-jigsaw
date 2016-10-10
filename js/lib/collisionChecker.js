;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory()
    } else {
        // Window
        root.collisionChecker = factory()
    }
}(this, function () {
    /**
     * 检测矩形碰撞 💥
     * @param targetElem 被碰撞元素
     * @param [elem] 拖动元素,如果不传,则用event代替
     * @returns {object}
     */
    function func(targetElem, elem) {
        var mode               = elem instanceof Element ? 'node' : 'event'
        var targetElemPosition = targetElem.getBoundingClientRect()

        var fnMap = {
            node: function () {
                var elemPosition = elem.getBoundingClientRect()
                var hit          =
                        !(elemPosition.bottom < targetElemPosition.top
                        || elemPosition.left > targetElemPosition.right
                        || elemPosition.top > targetElemPosition.bottom
                        || elemPosition.right < targetElemPosition.left)

                return {
                    hit   : hit,
                    top   : hit && elemPosition.top <= targetElemPosition.top,
                    right : hit && elemPosition.right >= targetElemPosition.right,
                    bottom: hit && elemPosition.top >= targetElemPosition.top,
                    left  : hit && elemPosition.left <= targetElemPosition.left
                }
            },

            event: function () {
                var event = func.getEventInfo(window.event)

                var hit =
                        !(event.clientY < targetElemPosition.top
                        || event.clientX > targetElemPosition.right
                        || event.clientY > targetElemPosition.bottom
                        || event.clientX < targetElemPosition.left)

                return {
                    hit   : hit,
                    top   : hit && event.clientY <= targetElemPosition.top + targetElemPosition.height / 2,
                    right : hit && event.clientX >= targetElemPosition.left + targetElemPosition.width / 2,
                    bottom: hit && event.clientY >= targetElemPosition.top + targetElemPosition.height / 2,
                    left  : hit && event.clientX <= targetElemPosition.left + targetElemPosition.width / 2
                }
            }
        }

        return fnMap[mode]()
    }

    func.getEventInfo = function (e) {
        return func.isTouch() ? e.targetTouches[0] : e
    }

    func.isTouch = function (e) {
        return 'ontouchstart' in window ||
            window.DocumentTouch && document instanceof window.DocumentTouch ||
            navigator.maxTouchPoints > 0 ||
            window.navigator.msMaxTouchPoints > 0
    }

    return func
}))