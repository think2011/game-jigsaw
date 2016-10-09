define(['tools', 'Dragify', 'collisionChecker'], function (tools, Dragify, collisionChecker) {
    var Class = function (picUrl) {
        this.$backdrop = $('.backdrop')
        this.sizeX     = 3
        this.sizeY     = 3
        this.axisBox   = []

        this.init(picUrl)
    }

    Class.prototype = {
        construct: Class,

        init: function (picUrl) {
            var that = this

            this.render(picUrl, this.sizeX, this.sizeY)

            this.$backdrop.on('tap', function () {
                $('.preview').removeClass('show-all')
                that.$backdrop.removeClass('active')
            })

            document.addEventListener('touchmove', function (e) {
                e.preventDefault()
            })
        },

        toRem: function (px) {
            return hotcss.px2rem(px, 750)
        },

        render: function (picUrl, sizeX, sizeY) {
            var that = this

            if (!sizeX) sizeX = 3
            if (!sizeY) sizeY = 3

            var img    = new Image()
            img.onload = function () {
                var width      = that.toRem(img.naturalWidth)
                var height     = that.toRem(img.naturalHeight)
                var unit       = 'rem'
                var $container = $('<div class="jigsaw-container"></div>')
                var $preview   = $('<div class="preview"><img src="' + picUrl + '" alt=""></div>')

                $container.css({width: width + unit, height: height + unit})

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

                        that.axisBox.push([params.x, params.y])
                        $container.append($html)
                    }
                }

                $('body').append($container).append($preview)

                setTimeout(function () {
                    that.shuffle(function () {
                        setTimeout(function () {
                            $preview.addClass('show')
                        }, 700)
                    })
                }, 500)

                $preview.on('tap', function () {
                    if ($preview.hasClass('show-all')) {
                        $preview.removeClass('show-all')
                        that.$backdrop.removeClass('active')
                    } else {
                        $preview.addClass('show-all')
                        that.$backdrop.addClass('active')
                    }
                })
            }

            img.src = picUrl
        },

        swap: function ($elem, $target) {
            var that           = this
            var elemIndex      = $elem.data('index')
            var targetIndex    = $target.data('index')
            var originPosition = that.originPosition
            var targetPosition = $target[0].getBoundingClientRect()

            this.move($target, that.originPosition)
            this.originPosition = targetPosition
            $elem.data('index', targetIndex)
            $target.data('index', elemIndex)
        },

        move: function ($target, position) {
            $target[0].moving = true
            $target[0].classList.add('moving')
            $target.css({
                top : position.top - ($target[0].offsetParent.offsetTop || 0),
                left: position.left - ($target[0].offsetParent.offsetLeft || 0)
            })

            setTimeout(function () {
                $target[0].moving = false
                $target[0].classList.remove('moving')
            }.bind(this), 500)
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

            $img.each(function (k, v) {
                var $v = $(v)

                $v.removeClass()
                    .css({
                        padding: 0,
                        border : that.toRem(2) + unit + ' solid #fff'
                    })
                    .addClass('img animated ' + animations[0])

                positions.push({
                    left : $v.css('left'),
                    top  : $v.css('top'),
                    index: k
                });
            })


            positions.sort(function () {
                return Math.random() - .5
            }).sort(function () {
                return Math.random() - .5
            }).sort(function () {
                return Math.random() - .5
            })
            setTimeout(function () {
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

                    new Dragify(v)
                        .on('start', function (current) {
                            that.originPosition = current.getBoundingClientRect()
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
                            that.move($(current), that.originPosition)
                        })
                })


                cb && cb()
            }, 500)
        }
    }

    return Class
})