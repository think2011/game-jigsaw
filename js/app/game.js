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
            this.render('./img/pic.gif', this.sizeX, this.sizeY)
        },

        render: function (picUrl, sizeX, sizeY) {
            var that = this

            if (!sizeX) sizeX = 3
            if (!sizeY) sizeY = 3

            var img    = new Image()
            img.onload = function () {
                var width      = img.naturalWidth
                var height     = img.naturalHeight
                var unit       = 'px'
                var $container = $('<div class="jigsaw-container"></div>')

                $container.css({width: width, height: height})

                for (var i = 0; i < sizeX; i++) {
                    var params = {
                        width : width / sizeX,
                        height: height / sizeY,
                        unit  : 'px',
                        url   : picUrl
                    }

                    for (var j = 0; j < sizeY; j++) {
                        params.x = params.width * j
                        params.y = params.height * i

                        var $html = $('<div class="img"></div>').css({
                            width              : params.width + unit,
                            height             : params.height + unit,
                            background         : 'url("' + params.url + '") no-repeat',
                            left               : params.x,
                            top                : params.y,
                            backgroundPositionX: -params.x + unit,
                            backgroundPositionY: -params.y + unit
                        })

                        that.axisBox.push([params.x, params.y])
                        $container.append($html)
                    }
                }

                $('body').append($container)
            }

            img.src = picUrl
        }
    }

    return Class
})