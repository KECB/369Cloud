/**
 * @file 图片轮播组件
 */
(function() {
    var CLASS_STATE_ACTIVE = 'ui-state-active',
        CLASS_SLIDER_DOTS = 'ui-slider-dots',
        CLASS_SLIDER_GROUP = 'ui-slider-group',
        CLASS_SLIDER_ITEM = 'ui-slider-item',
        CLASS_SLIDER_IMG = 'ui-slider-img',
        CLASS_SLIDER = 'ui-slider';

    /**
     * @property {Object}  容器的选择器
     */
    var SELECTOR_SLIDER_DOTS = '.' + CLASS_SLIDER_DOTS,
    	SELECTOR_SLIDER_ITEM = '.' + CLASS_SLIDER_ITEM,
    	SELECTOR_SLIDER_IMG = '.' + CLASS_SLIDER_IMG,
        SELECTOR_SLIDER_GROUP = '.' + CLASS_SLIDER_GROUP;
    var defDots = '<p class="' + CLASS_SLIDER_DOTS + '"><%= new Array( len + 1 )' +
        '.join("<b></b>") %></p>';
    var loading = '<div class="ui-loading">' +
        '<div class="ui-spinner">' +
        '</div>' +
        '</div>'

    // todo 检测3d是否支持。
    var transitionEnd, translateZ = ' translateZ(0)';

    var render = function() {
        var _sl = this,
            opts = _sl.opts,
            viewNum = opts.mulViewNum || 1,
            items,
            container;
        _sl.loading = $(loading).appendTo(_sl.ref);
        _sl.index = opts.index,
            // 检测容器节点是否指定
            container = _sl.ref.find(SELECTOR_SLIDER_GROUP);
        // 检测是否构成循环条件
        if ((items = container.children()).length < viewNum + 1) {
            opts.loop = false;
        }

        _sl.length = container.children().length;

        // 如果节点少了，需要复制几份
        while (opts.loop && container.children().length < 3 * viewNum) {
            container.append(items.clone());
        }

        _sl._items = (_sl._container = container)
            .children()
            .toArray();

        _sl._pages = container.find(SELECTOR_SLIDER_ITEM);

        _sl.ref.trigger('donedom');
        opts.dots && initDots.call(_sl);
        initWidth.call(_sl);
        // 转屏事件检测
        $(window).on('ortchange', function() {
            initWidth.call(_sl);
        });
    };

    var bind = function() {
        var _sl = this,
            opts = _sl.opts;
        _sl.ref.on('slideend', $.proxy(handleEvent, _sl))
            .on('touchstart', $.proxy(handleEvent, _sl))
            .on('touchend', $.proxy(handleEvent, _sl));
        //dots添加
        if (opts.dots) {
            _sl.ref.on('slide', function(evt, to, from) {
                updateDots.apply(_sl, [to, from]);
            })
        }
        _sl._container.on(transitionEnd,
            $.proxy(tansitionEnd, _sl));
    };

    var handleEvent = function(evt) {
        var _sl = this,
            opts = _sl.opts;
        // if (element.classList.contains(CLASS_DISABLED)) {
        //     return;
        // }
        switch (evt.type) {
            case 'touchstart':
                _sl.stop();
                break;
            case 'touchend':
            case 'touchcancel':
            case 'slideend':
                _sl.play();
                break;
        }
    };

    /**
     * 更新dots
     */
    var updateDots = function(to, from) {
        var _sl = this,
            dots = _sl._dots;

        typeof from === 'undefined' || _sl.callZ(dots[from % this.length]).removeClass(CLASS_STATE_ACTIVE);
        _sl.callZ(dots[to % this.length]).addClass(CLASS_STATE_ACTIVE);
    };

    var initDots = function() {
        var _sl = this,
            opts = _sl.opts;
        var dots = _sl.ref.find(SELECTOR_SLIDER_DOTS);

        if (!dots.length) {
            dots = _sl.parseTpl(defDots, {
                len: _sl.length
            });
            dots = $(dots).appendTo(_sl.ref[0]);
        }

        _sl._dots = dots.children().toArray();
        updateDots.call(_sl, _sl.index);
    };



    var initWidth = function() {
        var _sl = this,
            opts = _sl.opts,
            width;

        // width没有变化不需要重排
        if ((width = _sl.ref.width()) === _sl.width) {
            return;
        }
        if (opts.fullPage) {
            $(document.body).css('position','absolute');
            _sl.height = $(document.body).height();
        } else {
            if(opts.heightTarget == 'parent'){
                _sl.height = _sl.ref.parent().height();
            }else{
                _sl.height = _sl.ref.height();
            }
                
        }
        _sl.ref.height(_sl.height);
        _sl._pages.height(_sl.height);	
        _sl._pages.find(SELECTOR_SLIDER_IMG).height(_sl.height);	
        _sl.width = width;
        _sl.arrange();
        _sl._container.css('display', 'block');
        _sl.ref.find(SELECTOR_SLIDER_DOTS).css('display', 'block');
        _sl.ref.trigger('hiChange');
        _sl.loading.remove();
    };


    var tansitionEnd = function(evt) {
        var _sl = this,
            opts = _sl.opts;
        // ~~用来类型转换，等价于parseInt( str, 10 );
        if (~~evt.target.getAttribute('data-index') !== _sl.index) {
            return;
        }
        _sl.ref.trigger('slideend', [_sl.index]);
    };



    /**
     * 图片轮播组件
     */
    define(function(require, exports, module) {
        var $ui = require("ui"),
            cssPrefix = $.fx.cssPrefix;
        transitionEnd = $.fx.transitionEnd;
        var $slider = $ui.define('Slider', {
            /**
             * @property {Boolean} [loop=false] 是否连续滑动
             * @namespace options
             */
            loop: false,

            /**
             * @property {Number} [speed=400] 动画执行速度
             * @namespace options
             */
            speed: 100,

            /**
             * @property {Number} [index=0] 初始位置
             * @namespace options
             */
            index: 0,
            /**
             * @property {Boolean} [autoPlay=true] 是否开启自动播放
             * @namespace options
             */
            autoPlay: false,
            /**
             * @property {Number} [interval=4000] 自动播放的间隔时间（毫秒）
             * @namespace options
             */
            interval: 4000,

            /**
             * @property {Boolean} [dots=true] 是否显示轮播点
             * @namespace options
             */
            dots: false,
            /**
             * @property {Boolean} [guide=true] 是否显示导向按钮
             * @namespace options
             */
            guide: false,
            /**
             * @property {Boolean} [gestur=true] 是否添加手势事件。
             * @namespace options
             */
            gestur: false,
            /**
             * @property {Number} [mulViewNum=2] 当slider为multiview模式时，用来指定一页显示多少个图片。
             * @namespace options
             */
            mulViewNum: 1,
            /**
             * @property {Number} [space=10] 图片之间的间隔
             * @namespace options
             */
            space: 0,
            /**
             * @property {Number} [space=10f] 是否全屏显示
             * @namespace options
             */
            fullPage:false,
            /**
             * @property {Number} [space=10f] 高度目标 parent/self
             * @namespace options
             */
            heightTarget :'self'

        });
        //初始化
        $slider.prototype.init = function() {
            var _sl = this,
                opts = _sl.opts;
            if (opts.mulViewNum > 1) {
                //加載多图显示功能
                require.async('sMultiview', function(sm) {
                    sm.call(_sl);
                    opts.travelSize = 1;
                    // 初始dom结构
                    render.call(_sl);
                    //绑定事件
                    bind.call(_sl);
                    //自动轮播
                    opts.autoPlay && _sl.play();
                });
            } else {
                // 初始dom结构
                render.call(_sl);
                //绑定事件
                bind.call(_sl);
                //自动轮播
                opts.autoPlay && _sl.play();
            }

            //加載觸摸按鈕
            require.async('sTouch', function(st) {
                st.call(_sl);
            });
            if (opts.guide) {
                require.async('sGuide', function(sg) {
                    sg.call(_sl);
                });
            }
            if (opts.gestur) {
                require.async('sGestures', function(gt) {
                    gt.call(_sl);
                });
            }
        };



        // 重排items
        $slider.prototype.arrange = function() {
            var _sl = this,
                opts = _sl.opts,
                items = _sl._items,
                i = 0,
                item,
                len;

            _sl._slidePos = new Array(items.length);

            for (len = items.length; i < len; i++) {
                item = items[i];

                item.style.cssText += 'width:' + _sl.width + 'px;' + 'margin-right:' + opts.space + 'px;' +
                    'left:' + (i * (-_sl.width - opts.space)) + 'px;';
                item.setAttribute('data-index', i);

                _sl.move(i, i < _sl.index ? -_sl.width : i > _sl.index ? _sl.width : 0, 0);
            }

            _sl._container.css('width', (_sl.width + opts.space) * len);
        };

        /**
         * 自动播放。
         */
        $slider.prototype.play = function() {
            var _sl = this,
                opts = _sl.opts;
            if (opts.autoPlay && !_sl._timer) {
                _sl._timer = setTimeout(function() {
                    _sl.slideTo(_sl.index + 1);
                    _sl._timer = null;
                }, opts.interval);
            }
            return _sl;
        };

        /**
         * 停止自动播放
         * @method stop
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        $slider.prototype.stop = function() {
            var _sl = this;
            if (_sl._timer) {
                clearTimeout(_sl._timer);
                _sl._timer = null;
            }
            return _sl;
        };


        /**
         * 切换到下一个slide
         * @method next
         * @chainable
         * @return {self} 返回本身
         */
        $slider.prototype.next = function() {
            var _sl = this,
                opts = _sl.opts;
            if (opts.loop || _sl.index + 1 < _sl.length) {
                _sl.slideTo(_sl.index + 1);
            }

            return _sl;
        };
        /**
         * 切换到上一个slide
         * @method prev
         * @chainable
         * @return {self} 返回本身
         */
        $slider.prototype.prev = function() {
            var _sl = this,
                opts = _sl.opts;
            if (opts.loop || _sl.index > 0) {
                _sl.slideTo(_sl.index - 1);
            }

            return _sl;
        };



        $slider.prototype.move = function(index, dist, speed, immediate) {
            var _sl = this,
                opts = _sl.opts,
                slidePos = _sl._slidePos,
                items = _sl._items;

            if (slidePos[index] === dist || !items[index]) {
                return;
            }

            _sl.translate(index, dist, speed);
            slidePos[index] = dist; // 记录目标位置

            // 强制一个reflow
            immediate && items[index].clientLeft;
        };

        $slider.prototype.translate = function(index, dist, speed) {
            var _sl = this,
                opts = _sl.opts,
                slide = _sl._items[index],
                style = slide && slide.style;
            if (dist > 0) {
                dist = dist + opts.space
            } else if (dist < 0) {
                dist = dist - opts.space
            }
            if (!style) {
                return false;
            }

            style.cssText += cssPrefix + 'transition-duration:' + speed +
                'ms;' + cssPrefix + 'transform: translate(' +
                dist + 'px, 0)' + translateZ + ';';
        };

        $slider.prototype.circle = function(index, arr) {
            var _sl = this,
                opts = _sl.opts,
                len;

            arr = arr || _sl._items;
            len = arr.length;

            return (index % len + len) % arr.length;
        };

        $slider.prototype.slide = function(from, diff, dir, width, speed, opts) {
            var _sl = this,
                to, opts = _sl.opts;

            to = _sl.circle(from - dir * diff);

            // 如果不是loop模式，以实际位置的方向为准
            if (!opts.loop) {
                dir = Math.abs(from - to) / (from - to);
            }

            // 调整初始位置，如果已经在位置上不会重复处理
            _sl.move(to, -dir * width, 0, true);

            _sl.move(from, width * dir, speed);
            _sl.move(to, 0, speed);

            _sl.index = to;
            _sl.ref.trigger('slide', [to, from]);
            return _sl;
        };

        /**
         * 切换到第几个slide
         */
        $slider.prototype.slideTo = function(to, speed) {
            var _sl = this,
                opts = _sl.opts;
            if (_sl.index === to || _sl.index === _sl.circle(to)) {
                return this;
            }

            var index = _sl.index,
                diff = Math.abs(index - to),

                // 1向左，-1向右
                dir = diff / (index - to),
                width = _sl.width;

            speed = speed || opts.speed;

            return _sl.slide(index, diff, dir, width, speed, opts);
        };

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        $slider.prototype.getIndex = function() {
            return this.index;
        };

        /**
         * 销毁组件
         * @method destroy
         */
        $slider.prototype.destroy = function() {

        };

        //注册$插件
        $.fn.slider = function(opts) {
            var sliderObjs = [];
            opts || (opts = {});
            this.each(function() {
                var sliderObj = null;
                var id = this.getAttribute('data-slider');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    sliderObj = $ui.data[id] = new $slider(opts);
                    this.setAttribute('data-slider', id);
                } else {
                    sliderObj = $ui.data[id];
                }
                sliderObjs.push(sliderObj);
            });
            return sliderObjs.length > 1 ? sliderObjs : sliderObjs[0];
        };

    });

})();