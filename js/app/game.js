define(['tools'], function (tools) {
    var Class = function () {
        this.init()
    }

    Class.prototype = {
        construct: Class,

        init: function () {
            this.render('./img/pic.gif')
        },

        render: function (picUrl) {
            var img    = new Image()
            img.onload = function () {
                var html = '<div class="img" style="\nwidth: !{width}!{unit};\nheight: !{height}!{unit};\nbackground: url(" !{url}") no-repeat !{x}!{unit} !{y}!{unit};\n"></div>'.render({
                    width : 100,
                    height: 100,
                    unit  : 'xx',
                    x     : 1,
                    y     : 2
                })

                console.log(img.naturalWidth)
                console.log(img.naturalHeight)
            }

            img.src = picUrl
        }
    }

    return Class
})