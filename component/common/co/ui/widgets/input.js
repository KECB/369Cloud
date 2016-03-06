/**
 * @file Input组件
 */
(function(window, document) {
    var CLASS_ICON = 'ui-icon',
        CLASS_ACTIVE = 'ui-active',
        CLASS_ICON_CLEAR = 'ui-icon-clear',
        CLASS_ICON_SPEECH = 'ui-icon-speech',
        CLASS_ICON_SEARCH = 'ui-icon-search',
        CLASS_INPUT_ROW = 'ui-input-row',
        CLASS_PLACEHOLDER = 'ui-placeholder',
        CLASS_HIDDEN = 'ui-hidden',
        CLASS_SEARCH = 'ui-search',
        CLASS_INPUT_CLEAR = 'ui-input-clear',
        CLASS_INPUT_SPEECH = 'ui-input-speech',

        SELECTOR_ICON_CLOSE = '.' + CLASS_ICON_CLEAR,
        SELECTOR_ICON_SPEECH = '.' + CLASS_ICON_SPEECH,
        SELECTOR_PLACEHOLDER = '.' + CLASS_PLACEHOLDER,
        SELECTOR_ACTION = '.ui-input-row input';


    var findRow = function(target) {
        for (; target && target !== document; target = target.parentNode) {
            if (target.classList && target.classList.contains(CLASS_INPUT_ROW)) {
                return target;
            }
        }
        return null;
    };

    //渲染
    var render = function() {
        var _ip = this,
            opts = _ip.opts,
            element = opts.ref;

        if (~opts.actions.indexOf('clear')) {
            opts.clearActionClass = CLASS_ICON + ' ' + CLASS_ICON_CLEAR + (element.value ? '' : (' ' + CLASS_HIDDEN));
            opts.clearActionSelector = SELECTOR_ICON_CLOSE;
        }
        if (~opts.actions.indexOf('speech')) {
            opts.speechActionClass = CLASS_ICON + ' ' + CLASS_ICON_SPEECH;
            opts.speechActionSelector = SELECTOR_ICON_SPEECH;
        }
        if (~opts.actions.indexOf('search')) {
            opts.searchActionClass = CLASS_PLACEHOLDER;
            opts.searchActionSelector = SELECTOR_PLACEHOLDER;
        }
    };

    var initAction = function() {
        var _ip = this,
            opts = _ip.opts,
            element = opts.ref;

        var row = element.parentNode;
        if (row) {
            if (opts.searchActionClass) {
                _ip._searchAction = createAction.apply(_ip, [row, opts.searchActionClass, opts.searchActionSelector]);
                _ip._searchAction.addEventListener(_ip.touchEve(), function(evt) {
                    _ip.focus(element);
                    evt.stopPropagation();
                });
            }
            if (opts.speechActionClass) {
                _ip._speechAction = createAction.apply(_ip, [row, opts.speechActionClass, opts.speechActionSelector]);
                _ip._speechAction.addEventListener('click', _ip.stopPropagation);
                // _ip._speechAction.addEventListener(_ip.touchEve(), function(evt) {
                //     speechActionClick.call(_ip,evt);
                // });
            }
            if (opts.clearActionClass) {
                _ip._clearAction = createAction.apply(_ip, [row, opts.clearActionClass, opts.clearActionSelector]);
                _ip._clearAction.addEventListener(_ip.touchEve(), function(evt) {
                    clearActionClick.call(_ip, evt);
                });

            }
        }
    };

    var createAction = function(row, actionClass, actionSelector) {
        var _ip = this,
            opts = _ip.opts,
            element = opts.ref;
        var action = row.querySelector(actionSelector);
        if (!action) {
            var action = document.createElement('span');
            action.className = actionClass;
            if (actionClass === opts.searchActionClass) {
                action.innerHTML = '<span class="' + CLASS_ICON + ' ' + CLASS_ICON_SEARCH + '"></span>' + element.getAttribute('placeholder');
                element.setAttribute('placeholder', '');
                if (element.value.trim()) {
                    row.classList.add(CLASS_ACTIVE);
                }
            }
            row.insertBefore(action, element.nextSibling);
        }
        return action;
    };


    var speechActionClick = function(evt) {
        if (this.isPlus()) {
            var _ip = this,
                opts = _ip.opts,
                element = opts.ref;
            element.value = '';

        } else {
            alert('当前浏览器不支持');
        }
        evt.preventDefault();
    };


    var clearActionClick = function(evt) {
        var _ip = this,
            opts = _ip.opts,
            element = opts.ref;
        element.value = '';
        _ip.focus(element);
        _ip._clearAction.classList.add(CLASS_HIDDEN);
        evt.preventDefault();
    };

    //绑定事件
    var bind = function() {
        var _ip = this,
            opts = _ip.opts,
            element = opts.ref;

        if (opts.clearActionClass) {
            var action = _ip._clearAction;
            if (!action) {
                return;
            }
            $.each(['keyup', 'change', 'input', 'focus', 'blur', 'cut', 'paste'], function(index, type) {
                (function(type) {
                    element.addEventListener(type, function() {
                        action.classList[element.value.trim() ? 'remove' : 'add'](CLASS_HIDDEN);
                    });
                })(type);
            });
        }
        if (opts.searchActionClass) {
            element.addEventListener('focus', function() {
                element.parentNode.classList.add(CLASS_ACTIVE);
            });
            element.addEventListener('blur', function() {
                if (!element.value.trim()) {
                    element.parentNode.classList.remove(CLASS_ACTIVE);
                }
            });
        }
    };
    /**
     * 文本框
     *
     */
    define(function(require, exports, module) {
        var $ui = require("ui");

        var $input = $ui.define('Input', {
            /**
             * 输入框类型
             * @type {function}
             */
            actions: 'clear'
        });

        $input.prototype.init = function() {
            render.call(this);
            initAction.call(this);
            bind.call(this);
        };

        $.fn.input = function(opts) {
            this.each(function() {
                var actions = [];
                var row = findRow(this.parentNode);
                var classList = this.classList;
                if (classList.contains(CLASS_INPUT_CLEAR)) {
                    actions.push('clear');
                }
                if (classList.contains(CLASS_INPUT_SPEECH)) {
                    actions.push('speech');
                }
                if (this.type === 'search' && row.classList.contains(CLASS_SEARCH)) {
                    actions.push('search');
                }
                var id = this.getAttribute('data-input-' + actions[0]);
                if (!id) {
                    id = ++$ui.uuid;
                    opts || (opts = {});
                    opts = $.extend(opts, {
                        ref: this,
                        actions: actions.join(',')
                    });
                    new $input(opts);
                    for (var i = 0, len = actions.length; i < len; i++) {
                        this.setAttribute('data-input-' + actions[i], id);
                    }
                }

            });
        };
        $(SELECTOR_ACTION).input();
    });
})(window, document);