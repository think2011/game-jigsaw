;(function () {
    var html = '<script id="lottery-layer" type="text/lottery-html">\n    <div class="lottery-layer swiper-container">\n        <div class="swiper-wrapper">\n            <div class="swiper-slide game-fail">\n                <div class="panel">\n                    <div class="badge badge-game-fail"></div>\n                    <h3>挑战失败, 再玩一次</h3>\n\n                    <div class="actions">\n                        <button data-type="replay" class="btn btn-default">再玩一次</button>\n                        <a href="//shop${shopId}.m.taobao.com" class="btn btn-primary to-shopping">进店逛逛</a>\n                    </div>\n                </div>\n            </div>\n            <div class="swiper-slide game">\n                <div class="panel">\n                    <div class="badge badge-game"></div>\n                    <h3>获得抽奖机会: <span>X1</span></h3>\n\n                    <div class="actions">\n                        <button data-type="draw" data-draw-type="game" class="btn btn-primary">立即抽奖</button>\n                        <button data-type="replay" class="btn btn-default">再玩一次</button>\n                    </div>\n                </div>\n            </div>\n            <div class="swiper-slide collect">\n                <div class="panel">\n                    <div class="badge badge-collect"></div>\n                    <h3>收藏宝贝获得抽奖机会</h3>\n\n                    <div class="actions">\n                        <button data-type="draw" data-draw-type="collect" class="btn btn-primary">立即抽奖</button>\n                        <button data-type="click:collect" class="btn btn-primary">收藏抽奖</button>\n                    </div>\n                </div>\n            </div>\n            <div class="swiper-slide shopping">\n                <div class="panel">\n                    <div class="badge badge-shopping"></div>\n                    <h3>加购物车获得抽奖机会</h3>\n\n                    <div class="actions">\n                        <button data-type="draw" data-draw-type="shopping" class="btn btn-primary">立即抽奖</button>\n                        <button data-type="click:shopping" class="btn btn-primary">加购抽奖</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="swiper-pagination"></div>\n        <div class="tips">滑动获得抽奖机会</div>\n\n        <!-- 宝贝列表 -->\n        <div class="goods-list">\n            <h1 class="title">\n                <a href="javascript:" data-type="close:goodsList" class="close">×</a>\n                ${title}\n            </h1>\n\n            <h3 class="sub-title">${subTitle}</h3>\n            <ul>\n                <li>\n                    <img data-src="${img}_270x270.jpg">\n                    <div class="title">\n                        ${title}\n                    </div>\n                    <button data-type="${task}"\n                            data-id="${id}"\n                            data-disabled="${disabled}"\n                            class="btn btn-primary">${taskBtn}\n                    </button>\n                </li>\n            </ul>\n        </div>\n    </div>\n\n\n\n</script>'
    $('body').append(html)

    /**
     * 抽奖&游戏结果
     * @param shopId number 店铺ID
     * @param options object
     * @param options[key] 任务类型, 目前有 shopping, collect
     * @param options[key].items 需要做任务的items
     *
     * @event on click:task(type) 点击了某任务
     * @event on click:replay 再玩一次
     * @event on click:draw 抽奖
     *
     * @event emit add:draw(type, [time=1]) 增加抽奖次数, type:任务类型, time:次数
     * @event emit reduce:draw(type, [time=1]) 扣除抽奖次数, type:任务类型, time:次数
     * @event emit show:win 游戏成功
     * @event emit show:fail 游戏失败
     * @event emit show:task(type) 弹出某任务
     * @event emit do:task(type) 做了某任务
     * @event emit done:task(type, items) 完成某个任务  type:任务类型, items:[{numIid: xxxx}]
     *
     * @example
     * new LotteryLayer({
        shopping: {
            items     : window.GAME_PARAMS.items
        })
     *
     * @constructor
     */
    var LotteryLayer = function (shopId, options) {
        Watcher.call(this)

        this.shopId     = shopId
        this.options    = options
        this.drawTotal  = {
            game    : {
                $draw : '获得抽奖机会: <span>X${num}</span>',
                $empty: '抽奖机会已用完',
                num   : 0
            },
            collect : {
                $draw  : '获得抽奖机会: <span>X${num}</span>',
                $empty : '抽奖机会已用完',
                $chance: '收藏宝贝获得抽奖机会',
                num    : 0
            },
            shopping: {
                $draw  : '获得抽奖机会: <span>X${num}</span>',
                $empty : '抽奖机会已用完',
                $chance: '加购物车获得抽奖机会',
                num    : 0
            }
        }
        this.taskConfig = {
            collect : {
                title      : '收藏宝贝',
                subTitle   : '收藏宝贝获得抽奖机会',
                taskBtn    : '收藏宝贝',
                taskBtnDone: '已收藏',
            },
            shopping: {
                title      : '加入购物车',
                subTitle   : '加入购物车获得抽奖机会',
                taskBtn    : '加入购物车',
                taskBtnDone: '已加购'
            }
        }

        this.init()
    }

    LotteryLayer.prototype = Object.create(Watcher.prototype)
    Object.assign(LotteryLayer.prototype, {
        construct: LotteryLayer,

        init: function () {
            var that = this

            for (var p in that.options) {
                if (!that.options.hasOwnProperty(p)) continue;

                // 生成保存已做任务的items
                that.options[p].addedItems = []
                that.options[p]            = JSON.parse(JSON.stringify(that.options[p]))
            }

            that.on('show:win', function () {
                that.show('game')
            })

            that.on('show:fail', function () {
                that.show('game-fail')
            })

            that.on('show:task', function (type) {
                that.showTask(type)
            })

            that.on('add:draw', function (type, time) {
                that.drawTotal[type].num += time || 1
                that.renderDraw()
            })

            that.on('reduce:draw', function (type, time) {
                that.drawTotal[type].num -= time || 1
                that.renderDraw()
            })

            that.on('done:task', function (type, items) {
                items.forEach(function (item) {
                    if (that.$goodsListInstance) {
                        var $item = that.$goodsListInstance.find('[data-id="' + item.numIid + '"]')

                        // 同步UI
                        $item.data('disabled', true)
                        $item.text(that.taskConfig[type].taskBtnDone)
                        $item[0].item._isDone = true
                    }

                    // 保存已完成
                    var isExist = that.options[type].addedItems.some(function (aItem) {
                        return aItem.numIid === item.numIid
                    })

                    if (!isExist) that.options[type].addedItems.push(item)
                })

                that.renderDraw()
            })
        },

        initEvent: function ($html) {
            var that = this

            $html.on('tap', function (event) {
                if (that.sliderMove) return

                var targetType = $(event.target).data('type')

                switch (targetType) {
                    case 'draw':
                        $(event.target)[0].disabled || that.emit('click:' + targetType, $(event.target).data('draw-type'))
                        break;
                    case 'replay':
                        that.emit('click:' + targetType)
                        that.hide()
                        break;

                    case 'click:collect':
                    case 'click:shopping':
                        that.emit('click:task', targetType.split(':')[1])
                        break;
                    default:
                    //
                }
            })
        },

        renderDraw: function () {
            var that = this

            if (that.$slide) {
                for (var p in that.drawTotal) {
                    if (!that.drawTotal.hasOwnProperty(p)) continue;
                    var item   = that.drawTotal[p]
                    var $slide = that.$slide.filter('.' + p)

                    if (item.num > 0) {
                        $slide.find('h3').html(item.$draw.render({num: item.num}))
                        $slide.find('.btn[data-type="draw"]').prop('disabled', false)
                    } else {
                        $slide.find('h3').html(item.$empty)
                        $slide.find('.btn[data-type="draw"]').prop('disabled', true)
                    }

                    // 检查已做任务情况
                    if (p === 'shopping' || p === 'collect') {
                        that.options[p].items.forEach(function (item) {
                            item._isDone = item._isDone || that.options[p].addedItems.some(function (addedItem) {
                                    return item.numIid === addedItem.numIid
                                })
                        })

                        var allDone = that.options[p].items.every(function (item) {
                            return item._isDone
                        })

                        if (allDone) {
                            $slide.find('.btn[data-type="show:' + p + '"]').prop('disabled', true)
                        } else {
                            item.num > 0 || $slide.find('h3').html(item.$chance)
                            $slide.find('.btn[data-type="show:' + p + '"]').prop('disabled', false)
                        }
                    }
                }
            }
        },

        show: function (slideClass) {
            var that       = this
            var $container = this.$container = $($('script#lottery-layer').html().render({shopId: that.shopId}))
            var $wrapper = $container.find('.swiper-wrapper')
            var $slide   = this.$slide = $wrapper.find('.swiper-slide').remove()
            var $goodsList = this.$goodsList = $container.find('.goods-list').remove()
            var $goodsListItem = this.$goodsListItem = $goodsList.find('li').remove()

            for (var p in that.options) {
                if (!that.options.hasOwnProperty(p)) continue;

                that.options[p].items.length && $slide.filter('.' + p).prependTo($wrapper)
            }
            $slide.filter('.' + slideClass).prependTo($wrapper)

            that.renderDraw()
            that.initEvent($container)
            $('body').append($container)

            that.swiper = new Swiper('.lottery-layer', {
                pagination         : '.swiper-pagination',
                width              : hotcss.rem2px(21.034666666666666, document.documentElement.offsetWidth),
                effect             : 'coverflow',
                centeredSlides     : true,
                slideToClickedSlide: true,
                paginationClickable: true,
                slidesPerView      : 2,
            })

            that.swiper.on('sliderMove', function () {
                that.sliderMove = true
            })
            that.swiper.on('onTransitionEnd', function () {
                that.sliderMove = false
            })
        },

        hide: function () {
            this.$container.remove()
        },

        showTask: function (type) {
            var that = this

            var html  = that.$goodsList[0].outerHTML.render({
                title   : that.taskConfig[type].title,
                subTitle: that.taskConfig[type].subTitle
            })
            var $html = that.$goodsListInstance = $(html)

            that.options[type].items.forEach(function (item) {
                var $item = $(that.$goodsListItem[0].outerHTML.render({
                    id      : item.numIid,
                    img     : item.picUrl,
                    title   : item.title,
                    task    : type,
                    disabled: item._isDone,
                    taskBtn : item._isDone ? that.taskConfig[type].taskBtnDone : that.taskConfig[type].taskBtn,
                }))

                $item.find('img').attr('src', $item.find('img').data('src'))
                $item.find('.btn')[0].item = item
                $html.find('ul').append($item)
            })

            $html.on('tap', function (event) {
                var targetType = $(event.target).data('type')
                switch (targetType) {
                    case 'collect':
                    case 'shopping':
                        if ($(event.target).data('disabled') === false) {
                            that.emit('do:task', targetType, $(event.target)[0].item)
                        }
                        break;

                    case 'close:goodsList':
                        that.hideTask()
                        break;

                    default:
                    //
                }
            })

            $('body').append($html)
            that.swiper.lockSwipes()
        },

        hideTask: function () {
            this.$goodsListInstance.remove()
            this.swiper.unlockSwipes()
        }
    })

    window.LotteryLayer = LotteryLayer
})()