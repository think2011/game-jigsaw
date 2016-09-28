define(['tools'], function (tools) {
    var Class = function () {
        this.sizeX   = 3
        this.sizeY   = 3
        this.axisBox = []

        this.init()
    }

    Class.prototype = {
        construct: Class,

        init: function () {
            this.render('./img/pic.jpg', this.sizeX, this.sizeY)
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

                $('body').append($container)

                setTimeout(function () {
                    // that.shuffle()
                }, 0)

                $('#shuffle').on('click', function () {
                    that.shuffle()
                })
            }

            img.src = picUrl
        },

        shuffle: function () {
            var that       = this
            var $container = $('.jigsaw-container')
            var $img       = $container.find('.img')
            var unit       = 'rem'
            var sortArray  = this.axisBox.slice(0).sort(function () {
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
                            left: sortArray[k][0] + unit,
                            top : sortArray[k][1] + unit,
                            border: that.toRem(2) + unit + ' solid #fff'
                        })
                    }, 500)
                })()
            })
        }
    }

    return Class
})