/**
 * @file fullpage组件
 */
(function($, window, undefined) {
    var cssPrefix = $.fx.cssPrefix;
    var transitionEnd = $.fx.transitionEnd;
    var translateZ = ' translateZ(0)';
    var CLASS_FULLPAGE_ARROW = 'ui-fullpage-arrow',
        CLASS_FULLPAGE_INNER = 'ui-fullPage-inner',
        CLASS_FULLPAGE_PAGE = 'ui-fullpage-page',
        CLASS_STATE_ACTIVE = 'ui-state-active',
        CLASS_FULLPAGE_DOTS = 'ui-fullpage-dots',
        CLASS_FULLPAGE_DOTS_CIRCLE = 'fa fa-circle-thin';

    var SELECTOR_FULLPAGE_INNER = '.' + CLASS_FULLPAGE_INNER,
        SELECTOR_FULLPAGE_PAGE = '.' + CLASS_FULLPAGE_PAGE;

    var arrow = '<span class="' + CLASS_FULLPAGE_ARROW + '"><b class="fa fa-angle-double-up fa-2x"></b></span>';
    var inner = '<div class="' + CLASS_FULLPAGE_INNER + '"></div>';
    var defDots = '<p class="' + CLASS_FULLPAGE_DOTS + '"><%= new Array( len + 1 )' +
        '.join("<i></i>") %></p>';

    $(document).on('touchmove', function(e) {
        e.preventDefault();
    });
    //渲染组件
    var render = function() {
        var _fp = this,
            opts = _fp.opts;
        _fp.curIndex = 0;
        _fp.startY = 0;
        _fp.movingFlag = false;
        opts.der = 0.1;
        _fp.ref.children().wrapAll(inner);
        _fp._inner = _fp.ref.find(SELECTOR_FULLPAGE_INNER);
        _fp._pages = _fp.ref.find(SELECTOR_FULLPAGE_PAGE);
        _fp.pagesLength = _fp._pages.length;
        opts.dots && initDots.call(_fp);
        update.call(_fp);
        _fp.status = 1;
        opts.arrow && (_fp._arrow = $(arrow).appendTo(_fp.ref));
        opts.gesture && (opts.loop = false)
    };
    //绑定事件
    var bind = function() {
        var _fp = this,
            opts = _fp.opts;


        _fp._inner.on('touchstart', function(e) {
            if (!_fp.status) {
                return 1;
            }
            if (_fp.movingFlag) {
                return 0;
            }

            _fp.startX = e.targetTouches[0].pageX;
            _fp.startY = e.targetTouches[0].pageY;
        });
        _fp._inner.on('touchend', function(e) {
            if (!_fp.status) {
                return 1;
            }
            if (_fp.movingFlag) {
                return 0;
            }
            console.log(e.changedTouches[0].pageY - _fp.startY);
            var sub = (e.changedTouches[0].pageY - _fp.startY) / _fp.height;
            console.log(sub);
            var der = ((sub > 0 && sub > opts.der) || (sub < 0&&sub < -opts.der)) ? sub > 0 ? -1 : 1 : 0;
            _fp.dir = -der // -1 向上 1 向下
            console.log(_fp.dir);
            moveTo.call(_fp, _fp.curIndex + der, true);

        });
        if (opts.gesture) {
            _fp._inner.on('touchmove', function(e) {
                if (!_fp.status) {
                    return 1;
                }
                if (_fp.movingFlag) {
                    _fp.startX = e.targetTouches[0].pageX;
                    _fp.startY = e.targetTouches[0].pageY;
                    return 0;
                }

                var y = e.changedTouches[0].pageY - _fp.startY;
                if ((_fp.curIndex == 0 && y > 0) || (_fp.curIndex === _fp.pagesLength - 1 && y < 0)) y /= 2;
                if ((_fp.curIndex == 0 && y > 0) || (_fp.curIndex == _fp.pagesLength - 1 && y < 0)) {
                    y = 0;
                }
                var dist = (-_fp.curIndex * _fp.height + y);
                _fp._inner.removeClass('anim');
                _fp._inner.css({
                    '-webkit-transform': 'translate3d(' + 0 + 'px , ' + dist + 'px , 0px);',
                    'transform': 'translate3d(' + 0 + 'px , ' + dist + 'px , 0px);'
                });
            });
        }

        // 翻转屏幕提示
        // ==============================      
        // 转屏事件检测
        $(window).on('ortchange', function(evt) {
            _fp.ref.trigger('ortchange');
        });

        _fp._inner.on(transitionEnd,
            $.proxy(tansitionEnd, _fp));
    };

    var tansitionEnd = function(evt) {
        var _fp = this,
            opts = _fp.opts;
        _fp.ref.trigger('afterChange', [_fp.curIndex]);
    };

    var update = function() {
        var _fp = this,
            opts = _fp.opts;
        if (opts.fullPage) {
            $(document.body).css('position','absolute');
            _fp.height = $(document.body).height();
        } else {
            _fp.height = _fp.ref.parent().height();
        }
        _fp.ref.height(_fp.height);
        _fp._pages.height(_fp.height);
        if (!opts.gesture) {
            $.each(_fp._pages, function(index, el) {
                move.call(_fp, index, 0);
            })
            move.call(_fp, _fp.curIndex, 0);
        }
    };

    var initDots = function() {
        var _fp = this,
            opts = _fp.opts;

        var dots = _fp.parseTpl(defDots, {
            len: _fp.pagesLength
        });
        dots = $(dots).appendTo(_fp.ref[0]);

        _fp._dots = dots.children().toArray();
        $(_fp._dots).addClass(CLASS_FULLPAGE_DOTS_CIRCLE);
        updateDots.call(_fp, _fp.curIndex);
    };

    /**
     * 更新dots
     */
    var updateDots = function(to, from) {
        var _fp = this,
            dots = _fp._dots;
        typeof from === 'undefined' || _fp.callZ(dots[from % _fp.pagesLength]).removeClass(CLASS_STATE_ACTIVE);
        _fp.callZ(dots[to % _fp.pagesLength]).addClass(CLASS_STATE_ACTIVE);
    };

    var fix = function(cur, pagesLength, loop) {
        var _fp = this;
        if (cur < 0) {
            return !!loop ? pagesLength - 1 : 0;
        }

        if (cur >= pagesLength) {
            if (!!loop) {
                return 0;
            } else {
                return pagesLength - 1;
            }
        }


        return cur;
    };
    var move = function(car, speed) {
        isMove = true;
        var _fp = this,
            opts = _fp.opts;
        var pre = car - 1 > -1 ? car - 1 : _fp.pagesLength - 1;
        var next = car + 1 < _fp.pagesLength ? car + 1 : 0;
        if (speed == 0) {
            speed = speedPre = speedNext = 0;
        } else {
            speed = speedPre = speedNext = opts.speed
        }
        if (_fp.dir == 1) { //向下
            speedPre = 0;
        } else {
            speedNext = 0;
        }
        console.log(_fp.dir);
        if (_fp.pagesLength == 1) {
            _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + speed +
                'ms;' + cssPrefix + 'transform: translate(0,' +
                (0 - _fp._pages[car].offsetTop) + 'px)' + translateZ + ';';
        } else if (_fp.pagesLength == 2) {
            if (typeof _fp.dir === 'undefined') {
                _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + speed +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[car].offsetTop) + 'px)' + translateZ + ';';
                _fp._pages[next].style.cssText += cssPrefix + 'transition-duration:' + 0 +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[next].offsetTop + _fp.height) + 'px)' + translateZ + ';';
            } else if (_fp.dir == -1) { //向上
                _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + 0 +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[car].offsetTop + _fp.height) + 'px)' + translateZ + ';';
                _fp._pages[pre].style.cssText += cssPrefix + 'transition-duration:' + speed +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[pre].offsetTop - _fp.height) + 'px)' + translateZ + ';';
                _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + speed +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[car].offsetTop) + 'px)' + translateZ + ';';
                
            } else if (_fp.dir == 1) { //向下
                _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + 0 +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[car].offsetTop - _fp.height - _fp.height) + 'px)' + translateZ + ';';
                _fp._pages[pre].style.cssText += cssPrefix + 'transition-duration:' + speed +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[pre].offsetTop + _fp.height) + 'px)' + translateZ + ';';
                _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + speed +
                    'ms;' + cssPrefix + 'transform: translate(0,' +
                    (0 - _fp._pages[car].offsetTop) + 'px)' + translateZ + ';';
            }
        } else {
            _fp._pages[pre].style.cssText += cssPrefix + 'transition-duration:' + speedPre +
                'ms;' + cssPrefix + 'transform: translate(0,' +
                (0 - _fp._pages[pre].offsetTop - _fp.height) + 'px)' + translateZ + ';';
            _fp._pages[car].style.cssText += cssPrefix + 'transition-duration:' + speed +
                'ms;' + cssPrefix + 'transform: translate(0,' +
                (0 - _fp._pages[car].offsetTop) + 'px)' + translateZ + ';';
            _fp._pages[next].style.cssText += cssPrefix + 'transition-duration:' + speedNext +
                'ms;' + cssPrefix + 'transform: translate(0,' +
                (0 - _fp._pages[next].offsetTop + _fp.height) + 'px)' + translateZ + ';';
        }
    };

    var moveTo = function(next, anim) {
        var _fp = this,
            opts = _fp.opts;
        var cur = _fp.curIndex;

        next = fix.call(_fp, next, _fp.pagesLength, opts.loop);

        if (anim) {
            _fp._inner.addClass('anim');
        } else {
            _fp._inner.removeClass('anim');
        }

        if (next !== cur) {
            _fp.ref.trigger('beforeChange', [cur, next]);
        }else{
            return;
        }

        _fp.movingFlag = true;
        _fp.curIndex = next;
        if (!opts.gesture) {
            move.call(_fp, next);
        } else {
            _fp._inner.css({
                '-webkit-transform': 'translate3d(' + 0 + 'px , ' + (-next * _fp.height) + 'px , 0px);',
                'transform': 'translate3d(' + 0 + 'px , ' + (-next * _fp.height) + 'px , 0px);'
            });
        }

        if (next !== cur) {
            _fp.ref.trigger('change', [cur, next]);
        }

        window.setTimeout(function() {
            _fp.movingFlag = false;
            if (next !== cur) {
                _fp._pages.removeClass('active').eq(next).addClass('active');
                opts.dots && updateDots.apply(_fp, [next, cur]);
            }
        }, opts.speed+100);

        return this;
    };


    define(function(require, exports, module) {
        var $ui = require("ui");

        //fullpage
        var $fullpage = $ui.define('Fullpage', {
            loop: false,
            gesture: false,
            dots: false,
            arrow: false,
            fullPage: true,
            speed: 500
        });

        //初始化
        $fullpage.prototype.init = function() {
            render.call(this);
            bind.call(this);
        };

        $.extend($fullpage.prototype, {
            start: function() {
                this.status = 1;
                return this;
            },
            stop: function() {
                this.status = 0;
                return this;
            },
            moveTo: function(next) {
                moveTo.call(this, next, true);
                return this;
            },
            prev: function() {
                this.moveTo(this.curIndex - 1);
                return this;
            },
            next: function() {
                this.moveTo(this.curIndex + 1);
                return this;
            },
            getCurIndex: function() {
                return this.curIndex;
            }
        });

        //注册$插件
        $.fn.fullpage = function(opts) {
            var fullpageObjs = [];
            opts || (opts = {});
            this.each(function() {
                var fullpageObj = null;
                var id = this.getAttribute('data-fullpage');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    fullpageObj = $ui.data[id] = new $fullpage(opts);
                    this.setAttribute('data-fullpage', id);
                } else {
                    fullpageObj = $ui.data[id];
                }
                fullpageObjs.push(fullpageObj);
            });
            return fullpageObjs.length > 1 ? fullpageObjs : fullpageObjs[0];
        };

        /*module.exports = function(opts){
            return new button(opts);
        };
    */
    });
})(Dom, window);