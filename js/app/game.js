define(['tools', 'Dragify', 'collisionChecker'], function (tools, Dragify, collisionChecker) {
    var Class = function () {
        this.$backdrop     = $('.backdrop')
        this.sizeX         = 3
        this.sizeY         = 3
        this.axisBox       = []
        this.originAxisBox = []

        this.init()
    }

    Class.prototype = {
        construct: Class,

        init: function () {
            var that = this

            this.render('./img/pic.jpg', this.sizeX, this.sizeY)

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

                        new Dragify($html[0])
                            .on('move', function () {
                                console.log($html[0].getBoundingClientRect().top,
                                    $container.find('.img')[1].getBoundingClientRect().top
                                )

                                /*    $container.find('.img').each(function (k, v) {
                                 if (v === $html[0]) return

                                 if (
                                 $html[0].getBoundingClientRect().left === v.getBoundingClientRect().left &&
                                 $html[0].getBoundingClientRect().top === v.getBoundingClientRect().top
                                 ) {
                                 }
                                 })*/
                            })

                        $html.data('position', [params.x, params.y])
                        that.axisBox.push([params.x, params.y])
                        $container.append($html)
                    }
                }

                that.originAxisBox = that.axisBox.slice()
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

                $('#shuffle').on('tap', function () {
                    that.swap($('.jigsaw-container').find('.img').eq(0), $('.jigsaw-container').find('.img').eq(1))
                })
            }

            img.src = picUrl
        },

        swap: function ($elem, $target) {
            var elemTop     = $elem.css('top')
            var elemLeft    = $elem.css('left')
            var $targetTop  = $target.css('top')
            var $targetLeft = $target.css('left')

            $elem.css('top', $targetTop)
            $elem.css('left', $targetLeft)
            $target.css('top', elemTop)
            $target.css('left', elemLeft)
        },

        shuffle: function (cb) {
            var that       = this
            var $container = $('.jigsaw-container')
            var $img       = $container.find('.img')
            var unit       = 'rem'
            var sortArray  = this.axisBox.slice(0)
                .sort(function () {
                    return Math.random() - 0.5
                }).sort(function () {
                    return Math.random() - 0.5
                }).sort(function () {
                    return Math.random() - 0.5
                })
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
                $(v).removeClass()
                    .css('padding', 0)
                    .addClass('img animated ' + animations[0]);

                (function () {
                    setTimeout(function () {
                        $(v).css({
                            left  : sortArray[k][0] + unit,
                            top   : sortArray[k][1] + unit,
                            border: that.toRem(2) + unit + ' solid #fff'
                        })

                        cb && cb()
                    }, 500)
                })()
            })
        }
    }

    return Class
})