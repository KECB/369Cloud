/**
 * @file switch组件
 */
(function() {
        var CLASS_SWITCH = 'ui-switch',
            CLASS_SWITCH_HANDLE = 'ui-switch-handle',
            CLASS_ACTIVE = 'ui-active',
            CLASS_DRAGGING = 'ui-dragging',
            CLASS_DISABLED = 'ui-disabled',

            SELECTOR_SWITCH_HANDLE = '.' + CLASS_SWITCH_HANDLE;

        var handle = function(event, target) {
            if (target.classList && target.classList.contains(CLASS_SWITCH)) {
                return target;
            }
            return false;
        };

        //渲染
        var render = function(){
            var _tog = this, opts = this.opts,element = opts.ref;
            _tog._handle||(_tog._handle = element.querySelector(SELECTOR_SWITCH_HANDLE));
            opts.toggleWidth = element.offsetWidth;
            opts.handleWidth = _tog._handle.offsetWidth;
            opts.handleX = opts.toggleWidth - opts.handleWidth - 3;
        };

        //绑定事件
        var bind = function(){
            var _tog = this, opts = this.opts,element = _tog.ref;
            element.on('touchstart', $.proxy(handleEvent, _tog));
            element.on('drag', $.proxy(handleEvent, _tog));
            element.on('swiperight', $.proxy(handleEvent, _tog));
            element.on('touchend', $.proxy(handleEvent, _tog));
            element.on('touchcancel', $.proxy(handleEvent, _tog));
        };   


        var handleEvent = function(evt) {
            var _tog = this, opts = this.opts,element = opts.ref;
            if (element.classList.contains(CLASS_DISABLED)) {
                return;
            }
            switch (evt.type) {
                case 'touchstart':
                    start.call(_tog,evt);
                    break;
                case 'drag':
                    drag.call(_tog,evt);
                    break;
                case 'swiperight':
                    swiperight.call(_tog,evt);
                    break;
                case 'touchend':
                case 'touchcancel':
                    end.call(_tog,evt);
                    break;
            }
        }; 

        var start = function(evt) {
            var _tog = this, opts = _tog.opts,element = opts.ref;
            element.classList.add(CLASS_DRAGGING);
            if (opts.toggleWidth === 0 || opts.handleWidth === 0) { //当switch处于隐藏状态时，width为0，需要重新初始化
                render.call(_tog);
            }
        };
        var drag = function(evt) {
            var _tog = this, opts = _tog.opts,element = opts.ref,detail = evt.detail;
            if (!opts.isDragging) {
                if (detail.direction === 'left' || detail.direction === 'right') {
                    opts.isDragging = true;
                    opts.lastChanged = undefined;
                    opts.initialState = element.classList.contains(CLASS_ACTIVE);
                }
            }
            if (opts.isDragging) {
                setTranslateX.call(_tog,detail.deltaX);
                evt.stopPropagation();
                detail.gesture.preventDefault();
            }
        };
        var swiperight = function(evt) {
            var _tog = this, opts = _tog.opts;
            if (opts.isDragging) {
                evt.stopPropagation();
            }
        };
        var end = function(evt) {
            var _tog = this, opts = _tog.opts,element = opts.ref;
            element.classList.remove(CLASS_DRAGGING);
            if (opts.isDragging) {
                opts.isDragging = false;
                evt.stopPropagation();
                var active = element.classList.contains(CLASS_ACTIVE);
                _tog.ref.trigger('toggle', [active]);
            } else {
                _tog.toggle();
            }
        };

        var setTranslateX = $.animationFrame(function(x) {
            var _tog = this, opts = _tog.opts,element = opts.ref,classList = element.classList;
            if (!opts.isDragging) {
                return;
            }
            var isChanged = false;
            if ((opts.initialState && -x > (opts.handleX / 2)) || (!opts.initialState && x > (opts.handleX / 2))) {
                isChanged = true;
            }
            if (opts.lastChanged !== isChanged) {
                if (isChanged) {
                    _tog._handle.style.webkitTransform = 'translate3d(' + (opts.initialState ? 0 : opts.handleX) + 'px,0,0)';
                    classList[opts.initialState ? 'remove' : 'add'](CLASS_ACTIVE);
                } else {
                    _tog._handle.style.webkitTransform = 'translate3d(' + (opts.initialState ? opts.handleX : 0) + 'px,0,0)';
                    classList[opts.initialState ? 'add' : 'remove'](CLASS_ACTIVE);
                }
                opts.lastChanged = isChanged;
            }

        });

        

    define(function(require, exports, module) {
        var $ui = require("ui");

        var $switch = $ui.define('Switch',{});
        
        $switch.prototype.init = function() {
            render.call(this);
            bind.call(this);
        };
        
        $switch.prototype.toggle = function() {
            var _tog = this, opts = _tog.opts,element = opts.ref,classList = element.classList;
            if (classList.contains(CLASS_ACTIVE)) {
                classList.remove(CLASS_ACTIVE);
                _tog._handle.style.webkitTransform = 'translate3d(0,0,0)';
            } else {
                classList.add(CLASS_ACTIVE);
                _tog._handle.style.webkitTransform = 'translate3d(' + opts.handleX + 'px,0,0)';
            }
             var active = classList.contains(CLASS_ACTIVE);
            _tog.ref.trigger('toggle',[active]);
            return _tog;
        };
        
        //注册$插件
        $.fn.switch = function(opts) {
            var switchObjs = [];
            var switchs = this;
            switchs.hasClass(CLASS_SWITCH)||(switchs = switchs.find('.'+CLASS_SWITCH));
            opts|| (opts = {});
            switchs.each(function() {
                var switchObj = null;
                var id = this.getAttribute('data-switch');
                if (!id) {
                    opts = $.extend(opts, { ref : this});
                    id = ++$ui.uuid;
                    switchObj = $ui.data[id] = new $switch(opts);
                    this.setAttribute('data-switch', id);
                } else {
                    switchObj = $ui.data[id];
                }
                switchObjs.push(switchObj);
            });
            return switchObjs.length > 1 ? switchObjs : switchObjs[0];
        };
    });
})();