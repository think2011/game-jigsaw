;(function () {
    var Class = function () {
        this.$container = $('#scene1')
        this.$btnStart  = this.$container.find('.start')
        this.$btnRule   = this.$container.find('.rule')

        this.init()
    }

    Class.prototype = {
        construct: Class,

        init: function () {
            var that = this

            this.$container.show()

            this.$btnStart.on('tap', function () {
                that.destroy()
                gameWatcher.emit('scene:start')
            })

            this.$btnRule.on('tap', function () {
                gameWatcher.emit('show:rule')
            })
        },

        destroy: function () {
            this.$container.remove()
        }
    }

    window.Scene1 = Class
})()