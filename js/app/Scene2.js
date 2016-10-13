;(function () {
    var Class = function (options) {
        var GAME_PARAMS = window.GAME_PARAMS

        this.options = Object.assign({
            items: GAME_PARAMS.items,
            time : GAME_PARAMS.time,
            sizeX: GAME_PARAMS.sizeX,
            sizeY: GAME_PARAMS.sizeY,
        }, options)

        this.$container  = $('#scene2')
        this.$jigsaw     = this.$container.find('.jigsaw')
        this.$countdown  = this.$container.find('.countdown')
        this.$btnPreview = this.$container.find('.btn-preview')
        this.$backdrop   = $('.backdrop')
        this.unit        = 'rem'
        this.aniQueue    = new AniQueue()

        this.options.items.sort(function () {
            return Math.random() - 0.5
        })

        this.init()
    }

    Class.prototype = {
        construct: Class,

        init: function () {
            var that    = this
            var options = this.options

            that.$container.show()
            that.aniQueue
                .add('#scene2', 'slideInRight', .3)
                .start()

            gameWatcher.on('game:replay', function () {
                that.start()
            })

            that.$btnPreview.on('touchstart', function (e) {
                e.preventDefault()
                e.stopPropagation()
                that.$container.find('.preview').addClass('active')
            })

            that.$btnPreview.on('touchend', function () {
                that.$container.find('.preview').removeClass('active')
            })

            document.addEventListener('touchmove', function (e) {
                e.preventDefault()
            })

            this.start()
        },

        toRem: function (px, designSize) {
            return hotcss.px2rem(px, designSize || 750)
        },

        start: function () {
            var options = this.options

            options.items.push(options.items.shift())
            this.render(options.items[0], options.sizeX, options.sizeY)
        },

        render: function (picUrl, sizeX, sizeY) {
            var that = this

            if (!sizeX) sizeX = 3
            if (!sizeY) sizeY = 3

            var img    = new Image()
            img.onload = function () {
                var size       = that.zoomSize({
                    w  : img.naturalWidth,
                    h  : img.naturalHeight,
                    max: 660
                })
                var width      = that.toRem(size.w)
                var height     = that.toRem(size.h)
                var unit       = that.unit
                var $container = $('<div class="jigsaw-container"></div>')

                $container
                    .css({width: width + unit, height: height + unit})
                    .append('<img class="preview" src="' + picUrl + '">')

                for (var i = 0; i < sizeX; i++) {
                    var params = {
                        width : width / sizeX,
                        height: height / sizeY,
                        url   : picUrl
                    }

                    for (var j = 0; j < sizeY; j++) {
                        params.x = params.width * j
                        params.y = params.height * i

                        var $html = $('<div class="img animated"></div>').css({
                            width              : params.width + unit,
                            height             : params.height + unit,
                            left               : params.x + unit,
                            top                : params.y + unit,
                            backgroundImage    : 'url("' + params.url + '")',
                            backgroundRepeat   : 'no-repeat',
                            backgroundPositionX: -params.x + unit,
                            backgroundPositionY: -params.y + unit,
                            backgroundSize     : width + unit + ' ' + height + unit,
                            padding            : '100%' // 解决奇怪的间隙问题
                        })

                        $container.append($html)
                    }
                }

                that.$jigsaw.empty().append($container)
                that.$countdown.html('')

                setTimeout(function () {
                    that.shuffle(function () {
                        that.$btnPreview.show()
                        that.setCountdown()
                        that.$countdown
                            .css('visibility', 'visible')
                            .addClass('animated bounceInDown')
                        that.aniQueue
                            .add('.btn-preview', 'fadeIn', .3)
                            .start()
                    })
                }, 1000)
            }

            img.src = picUrl + '_640x640.jpg'
        },

        zoomSize: function (options) {
            var w      = options.w
            var h      = options.h
            var newW   = options.newW
            var newH   = options.newH
            var max    = options.max
            var result = {w: w, h: h}

            if (newW && newH) {
                return result
            }
            else if (max) {
                return w > h
                    ? this.zoomSize({w: w, h: h, newW: max})
                    : this.zoomSize({w: w, h: h, newH: max})
            }
            else if (newW) {
                result.w = newW
                result.h = h * (newW / w)
            }
            else if (newH) {
                result.w = w * (newH / h)
                result.h = newH
            }

            return {
                w: Math.ceil(result.w),
                h: Math.ceil(result.h)
            }
        },

        setCountdown: function () {
            var that      = this
            var countdown = that.countdown = new Countdown(Date.now() + that.options.time)

            this.timeout = false
            countdown
                .on('countdown', function (time) {
                    that.$countdown.html('<span>' + time.m + '</span><span>' + time.s + '</span>')
                })
                .on('end', function () {
                    that.timeout = true
                    that.checkWin()
                })
        },

        swap: function ($elem, $target) {
            var that           = this
            var elemIndex      = $elem.data('index')
            var targetIndex    = $target.data('index')
            var targetPosition = {
                top : $target[0].offsetTop,
                left: $target[0].offsetLeft
            }

            this.move($target, that.originPosition)
            this.originPosition = targetPosition
            $elem.data('index', targetIndex)
            $target.data('index', elemIndex)
        },

        move: function ($target, position, cb) {
            if ($target[0].moving) return

            $target[0].dragify.emit('disabled')
            $target[0].moving = true
            $target[0].classList.add('moving')
            $target.one('webkitTransitionEnd', function () {
                $target[0].moving = false
                $target[0].classList.remove('moving')
                $target[0].dragify.emit('enabled')
                cb && cb()
            })

            $target.css({
                top : this.toRem(position.top, this.$jigsaw.width()) + this.unit,
                left: this.toRem(position.left, this.$jigsaw.width()) + this.unit
            })
        },

        checkWin: function () {
            var indexBox   = []
            var orderBox   = []
            var win        = false
            var $container = $('.jigsaw-container')
            var $img       = $container.find('.img')

            $img.each(function (k, v) {
                indexBox.push($(v).data('index'))
                orderBox.push($(v).data('order'))
            })

            win = indexBox.join() === orderBox.join()

            if (this.timeout && !win) {
                this.countdown.destroy()
                this.$countdown.html('<span>00</span><span>00</span>')
                gameWatcher.emit('scene:fail')
            }
            else if (win) {
                this.countdown.pause()
                gameWatcher.emit('scene:win')
            }

            return win
        },

        shuffle: function (cb) {
            var that       = this
            var $container = $('.jigsaw-container')
            var $img       = $container.find('.img')
            var unit       = 'rem'
            var positions  = []
            var animations = [
                'tada',
                'wobble',
                'swing',
                'jello',
                'shake',
            ].sort(function () {
                return Math.random() - .5
            })

            // 生成坐标
            $img.each(function (k, v) {
                var $v = $(v)

                $v.removeClass()
                    .css({
                        padding: 0,
                        border : that.toRem(2) + unit + ' solid #fff',
                    })
                    .addClass('img animated ' + animations[0])

                positions.push({
                    left : $v.css('left'),
                    top  : $v.css('top'),
                    index: k
                });
            })

            $img.eq(0).one('webkitAnimationEnd', function () {
                $img.eq(0)

                // 打乱坐标
                positions.sort(function () {
                    return .5 - Math.random()
                }).sort(function () {
                    return .5 - Math.random()
                }).sort(function () {
                    return .5 - Math.random()
                })

                // 准备动画
                $img.each(function (k, v) {
                    var $v       = $(v)
                    var position = positions.shift()
                    $v
                        .data('order', k)
                        .data('index', position.index)
                        .css({
                            left: position.left,
                            top : position.top
                        })
                })

                // 打乱动画
                setTimeout(function () {
                    $img.each(function (k, elem) {
                        elem.dragify = new Dragify(elem)
                            .on('start', function (current) {
                                that.$btnPreview.addClass('inactive')
                                that.$jigsaw.css('overflow', 'visible')
                                that.originPosition = {
                                    top : current.offsetTop,
                                    left: current.offsetLeft
                                }
                            })
                            .on('move', function (current) {
                                $container.find('.img').each(function (k, v) {
                                    if (v === current || v.moving) return

                                    if (collisionChecker(v).hit) {
                                        that.swap($(current), $(v))
                                    }
                                })
                            })
                            .on('end', function (current) {
                                that.$btnPreview.removeClass('inactive')
                                that.$jigsaw.css('overflow', 'hidden')
                                that.move($(current), that.originPosition, function () {
                                    that.checkWin()
                                })
                            })
                    })

                    cb && cb()
                }, 500)
            })
        }
    }


    window.Scene2 = Class
})()