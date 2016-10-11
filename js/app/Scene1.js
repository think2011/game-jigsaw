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

            var aniQueue = new AniQueue()

            aniQueue
                .add('#scene1 .man', 'bounceInDown',.7)
                .delay(.4)
                .add('#scene1 .title', 'bounceIn', 1)
                .delay(.5)
                .add('#scene1 .start', 'rollIn', .4)
                .delay(.3)
                .add('#scene1 .rule', 'rotateInDownRight', .3)
                .hide()
                .start(function () {
                    console.log('done')
                })

            this.$container.show()

            gameWatcher.on('game:play', function () {
                aniQueue
                    .add('#scene1', 'slideOutUp',.5)
                    .start(function () {
                        that.destroy()
                        new Scene2()
                    })
            })

            this.$btnStart.on('tap', function () {
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