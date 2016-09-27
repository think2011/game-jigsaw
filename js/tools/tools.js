define(['Fastclick'], function (FastClick) {
    // Polyfill
    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function () {
            FastClick.attach(document.body);
        }, false);
    }

    if (typeof Object.assign != 'function') {
        Object.assign = function (target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }

    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }

    /**
     * 替换字符串 !{}
     * @param obj
     * @returns {String}
     * @example
     * '我是!{str}'.render({str: '测试'});
     */
    String.prototype.render = function (obj) {
        var str = this, reg;

        Object.keys(obj).forEach(function (v) {
            reg = new RegExp('\\!\\{' + v + '\\}', 'g');
            str = str.replace(reg, obj[v]);
        });

        return str;
    };


    var Class = function () {
    }

    Class.prototype = {
        constructor: Class,

        /**
         * 随机数
         * @param min
         * @param max
         * @param retain
         * @returns {*|number}
         */
        random: function (min, max, retain) {
            if (!retain) retain = 2

            return this.decimal((Math.random() * (max - min + 1) + min), retain)
        },

        /**
         * 保留小数位
         * @param num
         * @param v
         * @returns {number}
         */
        decimal: function (num, v) {
            var splitData = (num + '').split('.')
            var a         = splitData[0]
            var b         = splitData[1]

            return +(a + '.' + b.substr(0, v))
        },
    }

    return new Class()
})

