/**
 * @file 滑动列表组件
 */
(function() {


    var CLASS_SWIPEOUT = 'ui-swipeout',
        CLASS_SWIPEOUT_DELETE = 'ui-swipeout-delete',
        CLASS_SWIPEOUT_CONTENT = 'ui-swipeout-content',
        CLASS_SWIPEOUT_ACTIONS_RIGHT = 'ui-swipeout-actions-right',
        CLASS_SWIPEOUT_ACTIONS_LEFT = 'ui-swipeout-actions-left',
        CLASS_SWIPEOUT_ACTIONS_OPENED = 'ui-swipeout-actions-opened',
        CLASS_SWIPEOUT_ACTIONS_NO_FOLD = 'ui-swipeout-actions-no-fold',
        CLASS_SWIPEOUT_OVERSWIPE = 'ui-swipeout-overswipe',
        CLASS_SWIPEOUT_OPENED = 'ui-swipeout-opened',
        CLASS_SWIPEOUT_DELETING = 'ui-swipeout-deleting',
        CLASS_SWIPEOUT_TRANSITIONING = 'ui-swipeout-transitioning';

    var SELECTOR_SWIPEOUT = '.' + CLASS_SWIPEOUT,
        SELECTOR_SWIPEOUT_DELETE = '.' + CLASS_SWIPEOUT_DELETE,
        SELECTOR_SWIPEOUT_CONTENT = '.' + CLASS_SWIPEOUT_CONTENT,
        SELECTOR_SWIPEOUT_ACTIONS_RIGHT = '.' + CLASS_SWIPEOUT_ACTIONS_RIGHT,
        SELECTOR_SWIPEOUT_ACTIONS_LEFT = '.' + CLASS_SWIPEOUT_ACTIONS_LEFT,
        SELECTOR_SWIPEOUT_ACTIONS_OPENED = '.' + CLASS_SWIPEOUT_ACTIONS_OPENED,
        SELECTOR_SWIPEOUT_OVERSWIPE = '.' + CLASS_SWIPEOUT_OVERSWIPE;

    var render = function() {
        var _sl = this;
        _sl.allowSwipeout = true;
        _sl.swipeoutOpenedEl = undefined;
        _sl.isTouched = false;
        _sl.isMoved = false;
        _sl.touchesStart = {};
        _sl.touchStartTime = undefined;
        _sl.touchesDiff = undefined;
        _sl.swipeOutEl = _sl.ref;
        _sl.swipeOutContent = undefined;
        _sl.actionsRight = undefined;
        _sl.actionsLeft = undefined;
        _sl.actionsLeftWidth = undefined;
        _sl.actionsRightWidth = undefined;
        _sl.translate = undefined;
        _sl.opened = undefined;
        _sl.openedActions = undefined;
        _sl.buttonsLeft = undefined;
        _sl.buttonsRight = undefined;
        _sl.direction = undefined;
        _sl.overswipeLeftButton = undefined;
        _sl.overswipeRightButton = undefined;
        _sl.overswipeLeft = false;
        _sl.overswipeRight = false;
        _sl.noFoldLeft = undefined;
        _sl.noFoldRight = undefined;
    };

    //绑定事件
    var bind = function() {
        var _sl = this;
        $(document).on('touchstart', function(e) {
            if (_sl.swipeoutOpenedEl) {
                var target = $(e.target);
                if (!(
                        _sl.swipeoutOpenedEl.is(target[0]) ||
                        target.parents(SELECTOR_SWIPEOUT).is(_sl.swipeoutOpenedEl)
                    )) {
                    _sl.close();
                }
            }
        });

        _sl.ref.on('touchstart', $.proxy(handleEvent, _sl));
        _sl.ref.on('touchmove', $.proxy(handleEvent, _sl));
        _sl.ref.on('touchend', $.proxy(handleEvent, _sl));

        _sl.ref.find(SELECTOR_SWIPEOUT_DELETE).on('tap', function(evt) {
            _sl.delete();
        });
    };

    var handleEvent = function(evt) {
        var _sl = this;
        switch (evt.type) {
            case 'touchstart':
                handleTouchStart.call(_sl, evt);
                break;
            case 'touchmove':
                handleTouchMove.call(_sl, evt);
                break;
            case 'touchend':
                handleTouchEnd.call(_sl, evt);
                break;
        }
    };

    var angle = function(start, end) {
        var diff_x = end.x - start.x,
            diff_y = end.y - start.y;
        //返回角度,不是弧度
        return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
    };

    var handleTouchStart = function(e) {
        var _sl = this;
        if (!_sl.allowSwipeout) return;
        _sl.isMoved = false;
        _sl.isTouched = true;
        _sl.touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        _sl.touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
        _sl.touchStartTime = (new Date()).getTime();
    };

    var handleTouchMove = function(e) {
        var _sl = this;
        e.stopPropagation();
        if (!_sl.isTouched) return;
        var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        var touchesEnd = {};
        touchesEnd.x = pageX;
        touchesEnd.y = pageY;
        if (Math.abs(angle(_sl.touchesStart, touchesEnd)) > 20) return;
        if (!_sl.isMoved) {
            _sl.swipeOutContent = _sl.swipeOutEl.find(SELECTOR_SWIPEOUT_CONTENT);
            _sl.actionsRight = _sl.swipeOutEl.find(SELECTOR_SWIPEOUT_ACTIONS_RIGHT);
            _sl.actionsLeft = _sl.swipeOutEl.find(SELECTOR_SWIPEOUT_ACTIONS_LEFT);
            _sl.actionsLeftWidth = _sl.actionsRightWidth = _sl.buttonsLeft = _sl.buttonsRight = _sl.overswipeRightButton = _sl.overswipeLeftButton = null;
            _sl.noFoldLeft = _sl.actionsLeft.hasClass(CLASS_SWIPEOUT_ACTIONS_NO_FOLD) || false;
            _sl.noFoldRight = _sl.actionsRight.hasClass(CLASS_SWIPEOUT_ACTIONS_NO_FOLD) || false;
            if (_sl.actionsLeft.length > 0) {
                _sl.actionsLeftWidth = _sl.actionsLeft.outerWidth();
                _sl.buttonsLeft = _sl.actionsLeft.children('span');
                _sl.overswipeLeftButton = _sl.actionsLeft.find(SELECTOR_SWIPEOUT_OVERSWIPE);
            }
            if (_sl.actionsRight.length > 0) {
                _sl.actionsRightWidth = _sl.actionsRight.outerWidth();
                _sl.buttonsRight = _sl.actionsRight.children('span');
                _sl.overswipeRightButton = _sl.actionsRight.find(SELECTOR_SWIPEOUT_OVERSWIPE);
            }
            _sl.opened = _sl.swipeOutEl.hasClass(CLASS_SWIPEOUT_OPENED);
            if (_sl.opened) {
                _sl.openedActions = _sl.swipeOutEl.find(SELECTOR_SWIPEOUT_ACTIONS_LEFT + SELECTOR_SWIPEOUT_ACTIONS_OPENED).length > 0 ? 'left' : 'right';
            }
            _sl.swipeOutEl.removeClass(CLASS_SWIPEOUT_TRANSITIONING);
            if (!false) {
                _sl.swipeOutEl.find(SELECTOR_SWIPEOUT_ACTIONS_OPENED).removeClass(CLASS_SWIPEOUT_ACTIONS_OPENED);
                _sl.swipeOutEl.removeClass(CLASS_SWIPEOUT_OPENED);
            }
        }
        _sl.isMoved = true;
        e.preventDefault();

        _sl.touchesDiff = pageX - _sl.touchesStart.x;
        _sl.translate = _sl.touchesDiff;

        if (_sl.opened) {
            if (_sl.openedActions === 'right') _sl.translate = _sl.translate - _sl.actionsRightWidth;
            else _sl.translate = _sl.translate + _sl.actionsLeftWidth;
        }

        if (_sl.translate > 0 && _sl.actionsLeft.length === 0 || _sl.translate < 0 && _sl.actionsRight.length === 0) {
            if (!_sl.opened) {
                _sl.isTouched = _sl.isMoved = false;
                return;
            }
            _sl.translate = 0;
        }

        if (_sl.translate < 0) _sl.direction = 'to-left';
        else if (_sl.translate > 0) _sl.direction = 'to-right';
        else {
            if (_sl.direction) _sl.direction = _sl.direction;
            else _sl.direction = 'to-left';
        }

        var i, buttonOffset, progress;

        _sl.overswipeLeft = false;
        _sl.overswipeRight = false;
        var $button;
        if (_sl.actionsRight.length > 0) {
            // Show right actions
            progress = _sl.translate / _sl.actionsRightWidth;
            if (_sl.translate < -_sl.actionsRightWidth) {
                _sl.translate = -_sl.actionsRightWidth - Math.pow(-_sl.translate - _sl.actionsRightWidth, 0.8);
                if (_sl.overswipeRightButton.length > 0) {
                    _sl.overswipeRight = true;
                }
            }
            for (i = 0; i < _sl.buttonsRight.length; i++) {
                if (typeof _sl.buttonsRight[i]._buttonOffset === 'undefined') {
                    _sl.buttonsRight[i]._buttonOffset = _sl.buttonsRight[i].offsetLeft;
                }
                buttonOffset = _sl.buttonsRight[i]._buttonOffset;
                $button = $(_sl.buttonsRight[i]);
                if (_sl.overswipeRightButton.length > 0 && $button.hasClass(CLASS_SWIPEOUT_OVERSWIPE)) {
                    $button.css({
                        left: (_sl.overswipeRight ? -buttonOffset : 0) + 'px'
                    });
                }
                $button.transform('translate3d(' + (_sl.translate - buttonOffset * (1 + Math.max(progress, -1))) + 'px,0,0)');
            }
        }
        if (_sl.actionsLeft.length > 0) {
            // Show left actions
            progress = _sl.translate / _sl.actionsLeftWidth;
            if (_sl.translate > _sl.actionsLeftWidth) {
                _sl.translate = _sl.actionsLeftWidth + Math.pow(_sl.translate - _sl.actionsLeftWidth, 0.8);
                if (_sl.overswipeLeftButton.length > 0) {
                    _sl.overswipeLeft = true;
                }
            }
            for (i = 0; i < _sl.buttonsLeft.length; i++) {
                if (typeof _sl.buttonsLeft[i]._buttonOffset === 'undefined') {
                    _sl.buttonsLeft[i]._buttonOffset = _sl.actionsLeftWidth - _sl.buttonsLeft[i].offsetLeft - _sl.buttonsLeft[i].offsetWidth;
                }
                buttonOffset = _sl.buttonsLeft[i]._buttonOffset;
                $button = $(_sl.buttonsLeft[i]);
                if (_sl.overswipeLeftButton.length > 0 && $button.hasClass(CLASS_SWIPEOUT_OVERSWIPE)) {
                    $button.css({
                        left: (_sl.overswipeLeft ? buttonOffset : 0) + 'px'
                    });
                }
                if (_sl.buttonsLeft.length > 1) {
                    $button.css('z-index', _sl.buttonsLeft.length - i);
                }
                $button.transform('translate3d(' + (_sl.translate + buttonOffset * (1 - Math.min(progress, 1))) + 'px,0,0)');
            }
        }
        _sl.swipeOutContent.transform('translate3d(' + _sl.translate + 'px,0,0)');
    };

    var handleTouchEnd = function(e) {
        var _sl = this;
        if (!_sl.isTouched || !_sl.isMoved) {
            _sl.isTouched = false;
            _sl.isMoved = false;
            return;
        }

        _sl.isTouched = false;
        _sl.isMoved = false;
        var timeDiff = (new Date()).getTime() - _sl.touchStartTime;
        var action, actionsWidth, actions, buttons, i, noFold;

        noFold = _sl.direction === 'to-left' ? _sl.noFoldRight : _sl.noFoldLeft;
        actions = _sl.direction === 'to-left' ? _sl.actionsRight : _sl.actionsLeft;
        actionsWidth = _sl.direction === 'to-left' ? _sl.actionsRightWidth : _sl.actionsLeftWidth;

        if (
            timeDiff < 300 && (_sl.touchesDiff < -10 && _sl.direction === 'to-left' || _sl.touchesDiff > 10 && _sl.direction === 'to-right') ||
            timeDiff >= 300 && Math.abs(_sl.translate) > actionsWidth / 2
        ) {
            action = 'open';
        } else {
            action = 'close';
        }
        if (timeDiff < 300) {
            if (Math.abs(_sl.translate) === 0) action = 'close';
            if (Math.abs(_sl.translate) === actionsWidth) action = 'open';
        }

        if (action === 'open') {
            _sl.swipeoutOpenedEl = _sl.swipeOutEl;
            _sl.swipeOutEl.trigger('open');
            _sl.swipeOutEl.addClass(CLASS_SWIPEOUT_OPENED+' '+CLASS_SWIPEOUT_TRANSITIONING);
            var newTranslate = _sl.direction === 'to-left' ? -actionsWidth : actionsWidth;
            _sl.swipeOutContent.transform('translate3d(' + newTranslate + 'px,0,0)');
            actions.addClass(CLASS_SWIPEOUT_ACTIONS_OPENED);
            buttons = _sl.direction === 'to-left' ? _sl.buttonsRight : _sl.buttonsLeft;
            if (buttons) {
                for (i = 0; i < buttons.length; i++) {
                    $(buttons[i]).transform('translate3d(' + newTranslate + 'px,0,0)');
                }
            }
            if (_sl.overswipeRight) {
                _sl.actionsRight.find(SELECTOR_SWIPEOUT_OVERSWIPE).trigger('tap');
            }
            if (_sl.overswipeLeft) {
                _sl.actionsLeft.find(SELECTOR_SWIPEOUT_OVERSWIPE).trigger('tap');
            }
        } else {
            _sl.swipeOutEl.trigger('close');
            _sl.swipeoutOpenedEl = undefined;
            _sl.swipeOutEl.addClass(CLASS_SWIPEOUT_TRANSITIONING).removeClass(CLASS_SWIPEOUT_OPENED);
            _sl.swipeOutContent.transform('');
            actions.removeClass(CLASS_SWIPEOUT_ACTIONS_OPENED);
        }

        var buttonOffset;
        if (_sl.buttonsLeft && _sl.buttonsLeft.length > 0 && _sl.buttonsLeft !== buttons) {
            for (i = 0; i < _sl.buttonsLeft.length; i++) {
                buttonOffset = _sl.buttonsLeft[i]._buttonOffset;
                if (typeof buttonOffset === 'undefined') {
                    _sl.buttonsLeft[i]._buttonOffset = _sl.actionsLeftWidth - _sl.buttonsLeft[i].offsetLeft - _sl.buttonsLeft[i].offsetWidth;
                }
                $(_sl.buttonsLeft[i]).transform('translate3d(' + (buttonOffset) + 'px,0,0)');
            }
        }
        if (_sl.buttonsRight && _sl.buttonsRight.length > 0 && _sl.buttonsRight !== buttons) {
            for (i = 0; i < _sl.buttonsRight.length; i++) {
                buttonOffset = _sl.buttonsRight[i]._buttonOffset;
                if (typeof buttonOffset === 'undefined') {
                    _sl.buttonsRight[i]._buttonOffset = _sl.buttonsRight[i].offsetLeft;
                }
                $(_sl.buttonsRight[i]).transform('translate3d(' + (-buttonOffset) + 'px,0,0)');
            }
        }
        _sl.swipeOutContent.transitionEnd(function(e) {
            if (_sl.opened && action === 'open' || closed && action === 'close') return;
            _sl.swipeOutEl.trigger(action === 'open' ? 'opened' : 'closed');
            if (_sl.opened && action === 'close') {
                if (_sl.actionsRight.length > 0) {
                    _sl.buttonsRight.transform('');
                }
                if (_sl.actionsLeft.length > 0) {
                    _sl.buttonsLeft.transform('');
                }
            }
        });
    };

    define(function(require, exports, module) {
        var $ui = require("ui");

        //swipelist
        var $swipelist = $ui.define('Swipelist', {});

        //初始化
        $swipelist.prototype.init = function() {
            render.call(this);
            bind.call(this);
        };

        $swipelist.prototype.swipeOpen = function(el, dir, callback) {
            var _sl = this;
            el = $(el);
            if (arguments.length === 2) {
                if (typeof arguments[1] === 'function') {
                    callback = dir;
                }
            }

            if (el.length === 0) return;
            if (el.length > 1) el = $(el[0]);
            if (!el.hasClass(CLASS_SWIPEOUT) || el.hasClass(CLASS_SWIPEOUT_OPENED)) return;
            if (!dir) {
                if (el.find(SELECTOR_SWIPEOUT_ACTIONS_RIGHT).length > 0) dir = 'right';
                else dir = 'left';
            }
            var swipeOutActions = el.find('.ui-swipeout-actions-' + dir);
            if (swipeOutActions.length === 0) return;
            var noFold = swipeOutActions.hasClass(CLASS_SWIPEOUT_ACTIONS_NO_FOLD) || false;
            el.trigger('open').addClass(CLASS_SWIPEOUT_OPENED).removeClass(CLASS_SWIPEOUT_TRANSITIONING);
            swipeOutActions.addClass(CLASS_SWIPEOUT_ACTIONS_OPENED);
            var buttons = swipeOutActions.children('span');
            var swipeOutActionsWidth = swipeOutActions.outerWidth();
            var translate = dir === 'right' ? -swipeOutActionsWidth : swipeOutActionsWidth;
            var i;
            if (buttons.length > 1) {
                for (i = 0; i < buttons.length; i++) {
                    if (dir === 'right') {
                        $(buttons[i]).transform('translate3d(' + (-buttons[i].offsetLeft) + 'px,0,0)');
                    } else {
                        $(buttons[i]).css('z-index', buttons.length - i).transform('translate3d(' + (swipeOutActionsWidth - buttons[i].offsetWidth - buttons[i].offsetLeft) + 'px,0,0)');
                    }
                }
                var clientLeft = buttons[1].clientLeft;
            }
            el.addClass(CLASS_SWIPEOUT_TRANSITIONING);
            for (i = 0; i < buttons.length; i++) {
                $(buttons[i]).transform('translate3d(' + (translate) + 'px,0,0)');
            }
            el.find(SELECTOR_SWIPEOUT_CONTENT).transform('translate3d(' + translate + 'px,0,0)').transitionEnd(function() {
                el.trigger('opened');
                if (callback) callback.call(el[0]);
            });
            _sl.swipeoutOpenedEl = el;
        };

        $swipelist.prototype.close = function(callback) {
            var _sl = this;
            var el = _sl.ref;
            if (el.length === 0) return;
            if (!el.hasClass(CLASS_SWIPEOUT_OPENED)) return;
            var dir = el.find(SELECTOR_SWIPEOUT_ACTIONS_OPENED).hasClass(CLASS_SWIPEOUT_ACTIONS_RIGHT) ? 'right' : 'left';
            var swipeOutActions = el.find(SELECTOR_SWIPEOUT_ACTIONS_OPENED).removeClass(CLASS_SWIPEOUT_ACTIONS_OPENED);
            var noFold = swipeOutActions.hasClass(CLASS_SWIPEOUT_ACTIONS_NO_FOLD) || false;
            var buttons = swipeOutActions.children('span');
            var swipeOutActionsWidth = swipeOutActions.outerWidth();
            _sl.allowSwipeout = false;
            el.trigger('close');
            el.removeClass(CLASS_SWIPEOUT_OPENED).addClass(CLASS_SWIPEOUT_TRANSITIONING);

            var closeTO;

            function onSwipeoutClose() {
                _sl.allowSwipeout = true;
                // buttons.transform('');
                el.trigger('closed');
                if (callback) callback.call(el[0]);
                if (closeTO) clearTimeout(closeTO);
            }
            el.find(SELECTOR_SWIPEOUT_CONTENT).transform('translate3d(' + 0 + 'px,0,0)').transitionEnd(onSwipeoutClose);
            closeTO = setTimeout(onSwipeoutClose, 500);

            for (var i = 0; i < buttons.length; i++) {
                if (dir === 'right') {
                    $(buttons[i]).transform('translate3d(' + (-buttons[i].offsetLeft) + 'px,0,0)');
                } else {
                    $(buttons[i]).transform('translate3d(' + (swipeOutActionsWidth - buttons[i].offsetWidth - buttons[i].offsetLeft) + 'px,0,0)');
                }
                $(buttons[i]).css({
                    left: 0 + 'px'
                });
            }
            if (_sl.swipeoutOpenedEl && _sl.swipeoutOpenedEl[0] === el[0]) _sl.swipeoutOpenedEl = undefined;
        };

        $swipelist.prototype.delete = function(callback) {
            var _sl = this;
            var el = _sl.ref;
            if (el.length === 0) return;
            if (el.length > 1) el = $(el[0]);
            _sl.swipeoutOpenedEl = undefined;
            el.trigger('delete');
            el.css({
                height: el.outerHeight() + 'px'
            });
            var clientLeft = el[0].clientLeft;
            el.css({
                height: 0 + 'px'
            }).addClass(CLASS_SWIPEOUT_DELETING+ '  ' +CLASS_SWIPEOUT_TRANSITIONING).transitionEnd(function() {
                el.trigger('deleted');
                if (callback) callback.call(el[0]);
                if (el.parents('.virtual-list').length > 0) {
                    var virtualList = el.parents('.virtual-list')[0].f7VirtualList;
                    var virtualIndex = el[0].f7VirtualListIndex;
                    if (virtualList && typeof virtualIndex !== 'undefined') virtualList.deleteItem(virtualIndex);
                } else {
                    el.remove();
                }
            });
            var translate = '-100%';
            el.find(SELECTOR_SWIPEOUT_CONTENT).transform('translate3d(' + translate + ',0,0)');
        };
        //注册$插件
        $.fn.swipelist = function(opts) {
            var swipelistObjs = [];
            opts || (opts = {});
            this.each(function() {
                var swipelistObj = null;
                var id = this.getAttribute('data-swipelist');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    swipelistObj = $ui.data[id] = new $swipelist(opts);
                    this.setAttribute('data-swipelist', id);
                } else {
                    swipelistObj = $ui.data[id];
                }
                swipelistObjs.push(swipelistObj);
            });
            return swipelistObjs.length > 1 ? swipelistObjs : swipelistObjs[0];
        };

        /*module.exports = function(opts){
            return new botton(opts);
        };
    */
    });
})();