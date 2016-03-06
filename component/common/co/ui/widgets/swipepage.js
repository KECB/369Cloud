/**
 * @file 图片轮播组件
 */
(function() {
    var CLASS_STATE_ACTIVE = 'ui-state-active',
        CLASS_SLIDER_GROUP = 'ui-slider-group',
        CLASS_SWIPE_GROUP = 'ui-swipe-group',
        CLASS_SWIPE_ITEM = 'ui-swipe-item';

    /**
     * @property {Object}  容器的选择器
     */
    var SELECTOR_SWIPE_GROUP = '.' + CLASS_SWIPE_GROUP,
        SELECTOR_SLIDER_GROUP = '.' + CLASS_SLIDER_GROUP;
    var loading = '<div class="ui-loading">' +
        '<div class="ui-spinner">' +
        '</div>' +
        '</div>'

    // todo 检测3d是否支持。
    var transitionEnd, translateZ = ' translateZ(0)';

    var render = function() {
        var _sp = this,
            opts = _sp.opts,
            viewNum = opts.viewNum || 1,
            items,
            container;
        _sp.loading = $(loading).appendTo(_sp.ref);
        _sp.index = opts.index,
            // 检测容器节点是否指定
            container = _sp.ref.find(SELECTOR_SWIPE_GROUP);
        (container.length == 0) && (container = _sp.ref.find(SELECTOR_SLIDER_GROUP));

        _sp.length = container.children().length;

        _sp._items = (_sp._container = container)
            .children()
            .toArray();
        _sp._items[_sp.index].setAttribute('actived', true);
        _sp.ref.trigger('donedom');
        initWidth.call(_sp);
    };

    var bind = function() {
        var _sp = this,
            opts = _sp.opts;
        _sp.ref.on('slideend', $.proxy(handleEvent, _sp))
            .on('touchend', $.proxy(handleEvent, _sp))
            .on('slide', function(evt, to, from) {

            })
        _sp._container.on(transitionEnd,
            $.proxy(tansitionEnd, _sp));
    };

    var handleEvent = function(evt) {
        var _sp = this,
            opts = _sp.opts;
        // if (element.classList.contains(CLASS_DISABLED)) {
        //     return;
        // }
        switch (evt.type) {
            case 'touchend':
            case 'touchcancel':
            case 'slideend':
                !_sp._items[_sp.index].getAttribute('actived') && _sp._items[_sp.index].setAttribute('actived', true);
                break;
        }
    };

    var initWidth = function() {
        var _sp = this,
            opts = _sp.opts,
            width, height;

        // width没有变化不需要重排
        if ((width = _sp.ref.width()) === _sp.width) {
            return;
        }
        if ((height = _sp.ref.height()) === _sp.height) {
            return;
        }
        _sp.width = width;
        _sp.height = height;
        _sp.arrange();
        _sp._container.css('display', 'block');
        _sp.ref.trigger('hiChange');
        _sp.loading.remove();
    };


    var tansitionEnd = function(evt) {
        var _sp = this,
            opts = _sp.opts;
        // ~~用来类型转换，等价于parseInt( str, 10 );
        var ele = evt.target;
        if ($(ele).hasClass(CLASS_SWIPE_ITEM)) {
            if (~~ele.getAttribute('data-index') !== _sp.index) {
                return;
            }
            _sp.ref.trigger('slideend', [_sp.index]);
            // console.log('tansitionEnd');
        }
    };



    /**
     * 图片轮播组件
     */
    define(function(require, exports, module) {
        var $ui = require("ui"),
            cssPrefix = $.fx.cssPrefix;
        transitionEnd = $.fx.transitionEnd;
        var $swipepage = $ui.define('Swipepage', {

            /**
             * @property {Number} [speed=400] 动画执行速度
             * @namespace options
             */
            speed: 100,

            /**
             * @property {Number} [index=0] 初始位置
             * @namespace options
             */
            index: 0

        });
        //初始化
        $swipepage.prototype.init = function() {
            var _sp = this,
                opts = _sp.opts;
            // 初始dom结构
            render.call(_sp);
            //绑定事件
            bind.call(_sp);

            //加載觸摸按鈕
            require.async('sTouch', function(st) {
                st.call(_sp);
            });
        };



        // 重排items
        $swipepage.prototype.arrange = function() {
            var _sp = this,
                opts = _sp.opts,
                items = _sp._items,
                i = 0,
                item, len;

            _sp._slidePos = new Array(items.length);

            for (len = items.length; i < len; i++) {
                item = items[i];

                item.style.cssText += 'width:' + _sp.width + 'px;' + 'height:' + _sp.height + 'px;' +
                    'left:' + (i * -_sp.width) + 'px;';
                item.setAttribute('data-index', i);

                _sp.move(i, i < _sp.index ? -_sp.width : i > _sp.index ? _sp.width : 0, 0);
            }

            _sp._container.css('width', _sp.width * len);
        };


        /**
         * 切换到下一个slide
         * @method next
         * @chainable
         * @return {self} 返回本身
         */
        $swipepage.prototype.next = function() {
            var _sp = this,
                opts = _sp.opts;
            if (_sp.index + 1 < _sp.length) {
                _sp.slideTo(_sp.index + 1);
            }

            return _sp;
        };
        /**
         * 切换到上一个slide
         * @method prev
         * @chainable
         * @return {self} 返回本身
         */
        $swipepage.prototype.prev = function() {
            var _sp = this,
                opts = _sp.opts;
            if (_sp.index > 0) {
                _sp.slideTo(_sp.index - 1);
            }

            return _sp;
        };



        $swipepage.prototype.move = function(index, dist, speed, immediate) {
            var _sp = this,
                opts = _sp.opts,
                slidePos = _sp._slidePos,
                items = _sp._items;

            if (slidePos[index] === dist || !items[index]) {
                return;
            }

            _sp.translate(index, dist, speed);
            slidePos[index] = dist; // 记录目标位置

            // 强制一个reflow
            immediate && items[index].clientLeft;
        };

        $swipepage.prototype.translate = function(index, dist, speed) {
            var _sp = this,
                opts = _sp.opts,
                slide = _sp._items[index],
                style = slide && slide.style;

            if (!style) {
                return false;
            }
            // var refreshs = _sp.getWidget('Refresh');
            // $.each(refreshs, function(key, value){
            //   console.log(key);
            // })
            style.cssText += cssPrefix + 'transition-duration:' + speed +
                'ms;' + cssPrefix + 'transform: translate(' +
                dist + 'px, 0)' + translateZ + ';';
        };

        $swipepage.prototype.circle = function(index, arr) {
            var _sp = this,
                opts = _sp.opts,
                len;

            arr = arr || _sp._items;
            len = arr.length;

            return (index % len + len) % arr.length;
        };

        $swipepage.prototype.slide = function(from, diff, dir, width, speed, opts) {
            var _sp = this,
                to, opts = _sp.opts;

            to = _sp.circle(from - dir * diff);

            dir = Math.abs(from - to) / (from - to);

            // 调整初始位置，如果已经在位置上不会重复处理
            _sp.move(to, -dir * width, 0, true);

            _sp.move(from, width * dir, speed);
            _sp.move(to, 0, speed);

            _sp.index = to;
            _sp.ref.trigger('slide', [to, from]);
            return _sp;
        };

        /**
         * 切换到第几个slide
         */
        $swipepage.prototype.slideTo = function(to, speed) {
            var _sp = this,
                opts = _sp.opts;
            if (_sp.index === to || _sp.index === _sp.circle(to)) {
                return this;
            }

            var index = _sp.index,
                diff = Math.abs(index - to),

                // 1向左，-1向右
                dir = diff / (index - to),
                width = _sp.width;

            speed = speed || opts.speed;

            return _sp.slide(index, diff, dir, width, speed, opts);
        };

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        $swipepage.prototype.getIndex = function() {
            return this.index;
        };

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        $swipepage.prototype.getItem = function(index) {
            return this._items[index];
        };

        /**
         * 销毁组件
         * @method destroy
         */
        $swipepage.prototype.destroy = function() {

        };

        //注册$插件
        $.fn.swipepage = function(opts) {
            var swipepageObjs = [];
            opts || (opts = {});
            this.each(function() {
                var swipepageObj = null;
                var id = this.getAttribute('data-swipepage');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    swipepageObj = $ui.data[id] = new $swipepage(opts);
                    this.setAttribute('data-swipepage', id);
                } else {
                    swipepageObj = $ui.data[id];
                }
                swipepageObjs.push(swipepageObj);
            });
            return swipepageObjs.length > 1 ? swipepageObjs : swipepageObjs[0];
        };

    });

})();