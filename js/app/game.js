define(['tools'], function (tools) {
    var Class = function () {
        this.init()
    }

    Class.prototype = {
        construct: Class,

        init: function () {
            this.render('./img/pic.gif')
        },

        render: function (picUrl, sizeX, sizeY) {
            if (!sizeX) sizeX = 3
            if (!sizeY) sizeY = 3

            var img    = new Image()
            img.onload = function () {
                var width  = img.naturalWidth
                var height = img.naturalHeight
                var total  = sizeX * sizeY

                var html = '<div class="img" style="\nwidth: !{width}!{unit};\nheight: !{height}!{unit};\nbackground: url("!{url}") no-repeat !{x}!{unit} !{y}!{unit};\n"></div>'.render({
                    width : width / sizeX,
                    height: height / sizeY,
                    unit  : 'px',
                    url   : picUrl,
                    x     : 1,
                    y     : 2
                })

                var i = 0;
                for (i; i < total; i++) {
                    console.log(i)
                }

                console.log(html)
            }

            img.src = picUrl
        }
    }

    return Class
})