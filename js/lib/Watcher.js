;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory()
    } else {
        // Window
        root.Watcher = factory()
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

    return Watcher
}))