/**
 * @file refresh 组件
 */
(function() {

    var CLASS_PULL_TOP_POCKET = 'ui-pull-top-pocket';
    var CLASS_PULL_BOTTOM_POCKET = 'ui-pull-bottom-pocket';
    var CLASS_PULL = 'ui-pull';
    var CLASS_PULL_LOADING = 'ui-pull-loading';
    var CLASS_PULL_CAPTION = 'ui-pull-caption';

    var CLASS_ICON = 'ui-icon';
    var CLASS_SPINNER = 'fa fa-spinner fa-pulse';
    var CLASS_ICON_PULLDOWN = 'ui-icon-pulldown';

    var CLASS_BLOCK = 'ui-block';
    var CLASS_HIDDEN = 'ui-hidden';

    var CLASS_SCROLL = 'ui-scroll';
    var CLASS_SCROLL_WRAPPER = 'ui-scroll-wrapper';

    var CLASS_LOADING_UP = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
    var CLASS_LOADING_DOWN = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
    var CLASS_LOADING = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_SPINNER;

    var pocketHtml = ['<div class="' + CLASS_PULL + '">', '<div class="{icon}"></div>', '<div class="' + CLASS_PULL_CAPTION + '">{contentrefresh}</div>', '</div>'].join('');


    var render = function() {
        var _re = this,
            opts = _re.opts;
        _re.wrapper = _re.ref;
        _re.scrollEl = _re.wrapper.children().first();
        if (opts.down && opts.down.hasOwnProperty('callback')) {
            _re.topPocket = _re.scrollEl.find('.' + CLASS_PULL_TOP_POCKET);
            if (!_re.topPocket[0]) {
                _re.topPocket = createPocket(CLASS_PULL_TOP_POCKET, opts.down.contentrefresh, CLASS_LOADING_DOWN);
                _re.topPocket.insertBefore(_re.scrollEl);
            }
            _re.topLoading = _re.topPocket.find('.' + CLASS_PULL_LOADING);
            _re.topCaption = _re.topPocket.find('.' + CLASS_PULL_CAPTION);
        }
        if (opts.up && opts.up.hasOwnProperty('callback')) {
            _re.bottomPocket = _re.scrollEl.find('.' + CLASS_PULL_BOTTOM_POCKET);
            if (!_re.bottomPocket[0]) {
                _re.bottomPocket = createPocket(CLASS_PULL_BOTTOM_POCKET, opts.up.contentdown, CLASS_LOADING);
                _re.bottomPocket.appendTo(_re.scrollEl);
                _re.bottomPocket.addClass(CLASS_BLOCK);
                _re.bottomPocket.css('visibility', 'visible');
                // _re.initPullup = true;
            }
            _re.bottomLoading = _re.bottomPocket.find('.' + CLASS_PULL_LOADING);
            _re.bottomCaption = _re.bottomPocket.find('.' + CLASS_PULL_CAPTION);
        }
    };
    var angle = function(start, end) {
        var diff_x = end.x - start.x,
            diff_y = end.y - start.y;
        //返回角度,不是弧度
        return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
    }

    var bind = function() {
        var _re = this,
            opts = _re.opts,
            touchesStart, touchesEnd;

        _re.scroller.on('scrollStart', function() {
            touchesStart = {
                x: this.pointX,
                y: this.pointY
            };
            if (!_re.loading) {
                _re.pulldown = _re.pullup = _re.pullPocket = _re.pullCaption = _re.pullLoading = false
            }
        });
        _re.scroller.on('scroll', function(e) {
            touchesEnd = {
                x: this.pointX,
                y: this.pointY
            }
            if (!(opts.enablePullup || opts.enablePulldown)) {
                _re.disableScroll();
            } else if (!opts.enablePullup) {
                if (this.distY < 0) {
                    _re.disableScroll();
                } else {
                    _re.enableScroll();
                }
            } else if (!opts.enablePulldown) {
                if (this.distY > 0) {
                    _re.disableScroll();
                } else {
                    _re.enableScroll();
                }
            }
            // console.log(angle(touchesEnd,touchesStart));
            // if(Math.abs(angle(touchesEnd,touchesStart)) < 30)return;
            if (!_re.pulldown && !_re.loading && _re.topPocket && this.directionY === -1 && this.y >= 0) {
                initPulldownRefresh.call(_re);
            }
            if (!_re.pullup && !_re.finished && !_re.loading && _re.topPocket && this.directionY === 1 && this.y < 0) {
                initPullupRefresh.call(_re);
            }
            if (_re.pulldown) {
                setCaption.call(_re, this.y > opts.down.height ? opts.down.contentover : opts.down.contentdown);
            }

            if (this.maxScrollY == -1) {
                this.maxScrollY = 0 - opts.up.height;
            }
            var disY = this.maxScrollY - this.y
            if (_re.pullup && !_re.finished && disY > 10) {
                _re.autoUpHidden = false;
                setCaption.call(_re, Math.abs(this.y) > opts.up.height ? opts.up.contentover : opts.up.contentdown);
            } else if (disY < 10 && disY > 0 - opts.up.height) {
                if (_re.pullup && !_re.loading && !_re.finished) {
                    !opts.up.display && (_re.autoUpHidden = true)
                }
            }
            if (_re.pulldown && this.y > 0 && this.y < opts.down.height) {
                _re.autoDownHidden = true;
            }else{
                _re.autoDownHidden = false;
            }
        });

        _re.scroller.on('scrollEnd', function(e) {
            if (_re.autoUpHidden) {
                _re.autoUpHidden = false;
                _re.scroller.scrollTo(0, 0, _re.scroller.options.bounceTime, _re.scroller.options.bounceEasing);
                _re.ref.trigger('cancelRefresh');
            } else if (_re.pulldown && _re.autoDownHidden) {
                _re.autoDownHidden = false;
                _re.ref.trigger('cancelRefresh');
            }

        });

        var _resetPosition = _re.scroller.resetPosition;
        $.extend(_re.scroller, {
            resetPosition: function(time) {
                if (_re.pulldown && this.y >= opts.down.height) {
                    _re.pulldownLoading();
                    return true;
                }
                if (this.maxScrollY == -1) {
                    this.maxScrollY = 0 - opts.up.height;
                }
                var disY = this.maxScrollY - this.y
                if (_re.pullup && disY > 10 && !_re.loading && !_re.finished) {
                    _re.pullupLoading();
                    return true;
                }
                return _resetPosition.call(_re.scroller, time);
            }
        });

    };

    var initPulldownRefresh = function() {
        var _re = this,
            opts = _re.opts;
        if (!opts.enablePulldown) {
            return;
        }
        _re.ref.trigger('beforeRefresh');
        _re.pulldown = true;
        _re.pullup = false;
        _re.pullPocket = _re.topPocket;
        _re.pullPocket.addClass(CLASS_BLOCK);
        _re.pullPocket.css('visibility', 'visible');
        _re.pullCaption = _re.topCaption;
        _re.pullLoading = _re.topLoading;
    };
    var initPullupRefresh = function() {
        var _re = this,
            opts = _re.opts;
        if (!opts.enablePullup) {
            return;
        }
        _re.ref.trigger('beforeRefresh');
        _re.pulldown = false;
        _re.pullup = true;
        _re.pullPocket = _re.bottomPocket;
        _re.pullCaption = _re.bottomCaption;
        _re.pullLoading = _re.bottomLoading;
        // _re.scroller.refresh();
    };

    var resetPosition = function(scroller) {
        var _re = this,
            opts = _re.opts;
        if (_re.pulldown && scroller.y >= opts.down.height) {
            _re.pulldownLoading();
            return true;
        }
    };

    var createPocket = function(clazz, content, iconClass) {
        var pocket = document.createElement('div');
        pocket.className = clazz;
        pocket.innerHTML = pocketHtml.replace('{contentrefresh}', content).replace('{icon}', iconClass);
        return $(pocket);
    };

    var setCaption = function(title, reset) {
        var _re = this,
            opts = _re.opts;
        if (_re.loading) {
            return;
        }
        var pocket = _re.pullPocket[0];
        var caption = _re.pullCaption[0];
        var loading = _re.pullLoading[0];
        var isPulldown = _re.pulldown;
        if (pocket) {
            if (reset) {
                caption.innerHTML = '';
                loading.className = '';
                loading.style.webkitAnimation = "";
                loading.style.webkitTransition = "";
                loading.style.webkitTransform = "";
            } else {
                if (title !== _re.lastTitle) {
                    caption.innerHTML = title;
                    if (isPulldown) {
                        caption.innerHTML = title;
                        if (title === opts.down.contentrefresh) {
                            loading.className = CLASS_LOADING;
                            loading.style.webkitAnimation = "spinner-spin 1s step-end infinite";
                        } else if (title === opts.down.contentover) {
                            loading.className = CLASS_LOADING_UP;
                            loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
                            loading.style.webkitTransform = "rotate(180deg)";
                        } else if (title === opts.down.contentdown) {
                            loading.className = CLASS_LOADING_DOWN;
                            loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
                            loading.style.webkitTransform = "rotate(0deg)";
                        }
                    } else {
                        if (title === opts.up.contentrefresh) {
                            $(loading).css('display', 'inline-block');
                            $(loading).css('visibility', 'visible');
                            if ($.os.android && ($.os.version == '4.3')) {
                                $('html').css('visibility', 'hidden');
                                setTimeout(function() {
                                    $('html').css('visibility', 'visible');
                                }, 80);
                            }
                        } else {
                            loading.style.display = 'none';
                        }
                    }
                    _re.lastTitle = title;
                }
            }

        }
    };

    /**
     * 刷新组件
     */
    define(function(require, exports, module) {
        var $ui = require("ui");
        require("scroll");
        var $refresh = $ui.define('Refresh', {
            down: {
                height: 50,
                contentdown: '下拉可以刷新',
                contentover: '释放立即刷新',
                contentrefresh: '正在刷新...'
            },
            up: {
                height: 40,
                display: true,
                contentdown: '上拉显示更多',
                contentover: '释放立即刷新',
                contentrefresh: '正在加载...',
                contentnomore: '没有更多数据了'
            },
            enablePulldown: true,
            enablePullup: true,

        });

        //初始化
        $refresh.prototype.init = function() {
            var _re = this,
                opts = _re.opts;

            _re.ref.addClass(CLASS_SCROLL_WRAPPER);
            _re.ref.children().wrapAll('<div class = "' + CLASS_SCROLL + '"/>');
            _re.scroller = _re.ref.scroll({
                scrollY: true,
                scrollX: false,
                bounceTime: 300,
                bounceEasing: 'quadratic',
                probeType: 2 //每滚动一像素触发
            });
            render.call(_re);
            bind.call(_re);
        };


        $refresh.prototype.pulldownLoading = function() {
            var _re = this,
                opts = _re.opts;
            if (!opts.enablePulldown) {
                return;
            }
            var time = _re.scroller.options.bounceTime;
            _re.scroller.scrollTo(0, opts.down.height, time, IScroll.utils.ease.circular);
            if (_re.loading) {
                return;
            }
            initPulldownRefresh.call(_re);
            setCaption.call(_re, opts.down.contentrefresh);
            _re.loading = true;
            var callback = opts.down.callback;
            callback && callback.call(_re);
        };

        $refresh.prototype.pullupLoading = function(callback) {
            var _re = this,
                opts = _re.opts;
            if (!opts.enablePullup) {
                return;
            }
            var time = _re.scroller.options.bounceTime;
            _re.scroller.scrollTo(0, _re.scroller.maxScrollY, time, _re.scroller.options.bounceEasing);
            if (_re.loading) {
                return;
            }
            initPullupRefresh.call(_re);
            setCaption.call(_re, opts.up.contentrefresh);
            _re.loading = true;
            callback = callback || opts.up.callback;
            callback && callback.call(this);
        };



        $refresh.prototype.endPulldownToRefresh = function() {
            var _re = this,
                opts = _re.opts;
            if (_re.topPocket && _re.loading && _re.pulldown) {
                _re.scroller.scrollTo(0, 0, _re.scroller.options.bounceTime, _re.scroller.options.bounceEasing);
                _re.loading = false;
                setCaption.apply(_re, [opts.down.contentdown, true]);
                setTimeout(function() {
                    _re.scroller.refresh();
                    _re.loading || _re.topPocket.css('visibility', 'hidden');
                    _re.ref.trigger('afterRefresh');
                }, 150);
            }
        };

        $refresh.prototype.endPullupToRefresh = function(finished) {
            var _re = this,
                opts = _re.opts;
            if (!opts.up.display) _re.scroller.scrollTo(0, 0, _re.scroller.options.bounceTime, _re.scroller.options.bounceEasing);
            if (_re.bottomPocket && _re.loading && !_re.pulldown) {
                _re.loading = false;
                if (finished) {
                    _re.finished = true;
                    setCaption.call(_re, opts.up.contentnomore);
                    _re.scroller.refresh();
                    _re.ref.trigger('finished');
                } else {
                    setCaption.call(_re, opts.up.contentdown);
                    setTimeout(function() {
                        _re.scroller.refresh();
                        _re.ref.trigger('afterRefresh');
                    }, 150);
                }
            }
        };

        $refresh.prototype.disablePulldown = function() {
            var _re = this,
                opts = _re.opts;
            opts.enablePulldown = false;
        };

        $refresh.prototype.disablePullup = function() {
            var _re = this,
                opts = _re.opts;
            opts.enablePullup = false;
        };

        $refresh.prototype.enablePulldown = function() {
            var _re = this,
                opts = _re.opts;
            opts.enablePulldown = true;
        };

        $refresh.prototype.enablePullup = function() {
            var _re = this,
                opts = _re.opts;
            opts.enablePullup = true;
        };

        $refresh.prototype.disableScroll = function() {
            var _re = this;
            co.verticalSwipe = false
        };

        $refresh.prototype.enableScroll = function() {
            var _re = this;
            co.verticalSwipe = true
        };

        /**
         * 销毁组件
         * @method destroy
         */
        $refresh.prototype.destroy = function() {

        };
        //注册$插件
        $.fn.refresh = function(opts) {
            var refObjs = [];
            opts || (opts = {});
            this.each(function() {
                var refObj = null;
                var id = this.getAttribute('data-ref');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    refObj = $ui.data[id] = new $refresh(opts);
                    this.setAttribute('data-ref', id);
                } else {
                    refObj = $ui.data[id];
                }
                refObjs.push(refObj);
            });
            return refObjs.length > 1 ? refObjs : refObjs[0];
        };

    });
})();