;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory()
    } else {
        // Window
        root.Countdown = factory()
    }
}(this, function () {
    var Watcher = function () {
        this._events     = {}
        this._tempEvents = {}
    }

    Watcher.prototype = {
        construct: Watcher,

        on: function (type, fn) {
            this._getEvent(type).push(fn)

            var tempEvent = this._getEvent(type, true)
            while (tempEvent.length) {
                fn.apply(fn, tempEvent.shift())
            }

            return this
        },

        emit: function (type) {
            var event  = this._getEvent(type)
            var params = Array.prototype.slice.call(arguments, 1)

            if (event.length) {
                event.forEach(function (fn) {
                    fn.apply(fn, params)
                })
            } else {
                this._getEvent(type, true).push(params)
            }

            return this
        },

        _getEvent: function (type, isTemp) {
            var event = isTemp ? '_tempEvents' : '_events'

            if (!this[event][type]) this[event][type] = []

            return this[event][type]
        },

        off: function (type, fn) {
            var event = this._getEvent(type)

            if (!fn) {
                this._events[type] = []
            } else {
                event.splice(event.indexOf(fn), 1)
            }

            return this
        }
    }

    var _second = 1000
    var _minute = _second * 60
    var _hour   = _minute * 60
    var _day    = _hour * 24

    var Class = function (date, countdownMs) {
        this.countdownMs = countdownMs || 1000
        this.end         = new Date(date)
        this.timer       = null

        this.init()
    }

    Class.prototype = Object.create(new Watcher)
    Object.assign(Class.prototype, {
        construct: Class,

        init: function () {
            var that = this
            var time = that._getTime()

            if (time.total > 0) {
                that.timer = setTimeout(function () {
                    that.emit('countdown', time)
                    that.init()
                }, that.countdownMs)
            } else {
                that.emit('countdown', {
                    d : '00',
                    h : '00',
                    ms: '00',
                    s : '00'
                })
                that.emit('end')
            }
        },

        _getTime: function () {
            var that     = this
            var now      = new Date()
            var distance = that.end - now - 1

            var days    = (distance / _day)
            var hours   = (distance % _day) / _hour
            var minutes = (distance % _hour) / _minute
            var seconds = (distance % _minute) / _second

            return {
                total: distance,
                d    : that._padNumber(Math.floor(days), 2),
                h    : that._padNumber(Math.floor(hours), 2),
                m    : that._padNumber(Math.floor(minutes), 2),
                s    : that._padNumber(Math.floor(seconds), 2),
                ms   : that._padNumber(Math.floor(('' + distance).substr(0, 2)), 2)
            }
        },

        _padNumber: function (num, fill) {
            //改自：http://blog.csdn.net/aimingoo/article/details/4492592
            var len = ('' + num).length;
            return (Array(
                fill > len ? fill - len + 1 || 0 : 0
            ).join(0) + num);
        },

        pause: function () {
            clearTimeout(this.timer)
            this.emit('countdown', this._getTime())
        },

        start: function () {
            this.init()
        }
    })

    return Class
}))