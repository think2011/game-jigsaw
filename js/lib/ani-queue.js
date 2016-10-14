;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory()
    } else {
        // Window
        root.AniQueue = factory()
    }
}(this, function () {
    var AniQueue = function () {
        this.queue = []
    }

    AniQueue.prototype = {
        construct: AniQueue,

        start: function (cb) {
            var that         = this
            var aniLen       = 0
            var isExecuteEnd = false
            var isAniEnd     = false
            var elemTask     = that.queue.filter(function (item) {
                return item.type === 'add'
            })

            var finallyCb = function () {
                if (isAniEnd && isExecuteEnd) {
                    elemTask.forEach(function (item) {
                        $(item.params[0]).removeClass(item.params[1]).removeClass('animated').css({
                            '-webkit-animation-duration': '',
                            '-moz-animation-duration'   : '',
                            '-ms-animation-duration'    : '',
                            '-o-animation-duration'     : '',
                            'animation-duration'        : '',
                        })
                    })

                    cb && cb()
                }
            }

            elemTask.forEach(function (item) {
                var $item = $(item.params[0])

                if (that.queue.some(function (taskItem) {
                        return taskItem.type === 'hide'
                    })) {
                    $item.hide()
                }

                $item.one('webkitAnimationEnd', function () {
                    aniLen++
                    isAniEnd = aniLen === elemTask.length
                    finallyCb()
                })
            })

            that._execute(function () {
                isExecuteEnd = true
                finallyCb()
            })
        },

        hide: function () {
            this.queue.push({
                type: 'hide'
            })

            return this
        },

        _execute: function (cb) {
            var that   = this
            var task   = this.queue.shift()
            var params = task.params

            var _cb = function () {
                if (that.queue.length) {
                    that._execute(cb)
                } else {
                    cb && cb()
                }
            }

            switch (task.type) {
                case 'add':
                    var $elem = $(params[0])

                    $elem.show().addClass(params[1]).addClass('animated')
                    if (params[2] !== undefined) {
                        $elem.css({
                            '-webkit-animation-duration': params[2] + 's',
                            '-moz-animation-duration'   : params[2] + 's',
                            '-ms-animation-duration'    : params[2] + 's',
                            '-o-animation-duration'     : params[2] + 's',
                            'animation-duration'        : params[2] + 's',
                        })
                    }

                    _cb()
                    break;

                case 'delay':
                    setTimeout(_cb, (params[0] * 1000))
                    break;

                default:
                    _cb()
            }
        },

        add: function (selector, animateClass, duration) {
            this.queue.push({
                type  : 'add',
                params: arguments
            })

            return this
        },


        delay: function (time) {
            this.queue.push({
                type  : 'delay',
                params: arguments
            })
            return this
        }
    }

    return AniQueue
}))