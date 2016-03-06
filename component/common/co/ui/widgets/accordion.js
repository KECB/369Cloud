/**
 * @file accordion 组件
 */
(function() {
    var CLASS_ACCORDION_ITEM = 'ui-accordion-item',
        CLASS_ACCORDION_ITEM_EXPANDED = 'ui-accordion-item-expanded',
        CLASS_ACCORDION_ITEM_LINK = 'ui-accordion-item-link',
        CLASS_ACCORDION = 'ui-accordion',
        CLASS_ACCORDION_ITEM_CONTENT = 'ui-accordion-item-content',
        CLASS_ACCORDION_ITEM_INNER = 'ui-accordion-item-inner',
        CLASS_ACCORDION_ITEM_TITLE = 'ui-accordion-item-title',
        CLASS_ACCORDION_ITEM_LINK_EXPANDED = 'ui-accordion-item-link-expanded';

    var SELECTOR_ACCORDION_ITEM = '.' + CLASS_ACCORDION_ITEM,
        SELECTOR_ACCORDION_ITEM_EXPANDED = '.' + CLASS_ACCORDION_ITEM_EXPANDED,
        SELECTOR_ACCORDION_ITEM_LINK = '.' + CLASS_ACCORDION_ITEM_LINK,
        SELECTOR_ACCORDION_ITEM_INNER = '.' + CLASS_ACCORDION_ITEM_INNER,
        SELECTOR_ACCORDION_ITEM_TITLE = '.' + CLASS_ACCORDION_ITEM_TITLE,
        SELECTOR_ACCORDION = '.' + CLASS_ACCORDION,
        SELECTOR_ACCORDION_ITEM_CONTENT = '.' + CLASS_ACCORDION_ITEM_CONTENT;

    var render = function() {
        var _acd = this,
            opts = _acd.opts;
        var toggleClose = opts.toggleClose;
        opts.toggleClose = false;
        _acd.ref.find('li.' + CLASS_ACCORDION_ITEM_EXPANDED).each(function(index, item) {
            _acd.accordionOpen(item);
        })
        opts.toggleClose = toggleClose;
        // _acd.ref.width()
    };

    //绑定事件
    var bind = function() {
        var _acd = this,
            opts = _acd.opts;
        _acd.ref.on(_acd.touchEve(), function(evt) {
            if ($(evt.target).is(SELECTOR_ACCORDION_ITEM_INNER) || $(evt.target).is(SELECTOR_ACCORDION_ITEM_TITLE) || $(evt.target).is(SELECTOR_ACCORDION_ITEM_LINK)) {
                var accordionItem = $(evt.target).closest(SELECTOR_ACCORDION_ITEM);
                _acd.accordionToggle(accordionItem);
            }
        })
    };

    define(function(require, exports, module) {
        var $ui = require("ui");
        //accordion
        var $accordion = $ui.define('Accordion', {
            toggleClose: true
        });

        //初始化
        $accordion.prototype.init = function() {
            var _acd = this;
            render.call(this);
            bind.call(this);

        };

        $accordion.prototype.accordionToggle = function(item) {
            var _acd = this,
                item = $(item);
            if (item.length === 0) return;
            if (item.hasClass(CLASS_ACCORDION_ITEM_EXPANDED)) _acd.accordionClose(item);
            else _acd.accordionOpen(item);
        };

        $accordion.prototype.accordionOpen = function(item) {
            var _acd = this,
                opts = _acd.opts,
                item = $(item);
            var list = item.parents(SELECTOR_ACCORDION).eq(0);
            var content = item.children(SELECTOR_ACCORDION_ITEM_CONTENT);
            if (content.length === 0) content = item.find(SELECTOR_ACCORDION_ITEM_CONTENT);
            var expandedItem = list.length > 0 && item.parent().children(SELECTOR_ACCORDION_ITEM_EXPANDED);
            if (expandedItem.length > 0) {
                opts.toggleClose && _acd.accordionClose(expandedItem);
                _acd.ref.trigger('toggle', [item, item.hasClass(CLASS_ACCORDION_ITEM_EXPANDED)]);
            }
            content.css('height', content[0].scrollHeight + 'px').transitionEnd(function() {
                content.transition(0);
                content.css('height', 'auto');
                var clientLeft = content[0].clientLeft;
                content.transition('');
                _acd.ref.trigger('opened', [item]);
            });
            _acd.ref.trigger('open', [item]);
            item.addClass(CLASS_ACCORDION_ITEM_EXPANDED);
            $(item.children()[0]).addClass(CLASS_ACCORDION_ITEM_LINK_EXPANDED);
        };

        $accordion.prototype.accordionClose = function(item) {
            var _acd = this,
                item = $(item);
            var content = item.children(SELECTOR_ACCORDION_ITEM_CONTENT);
            if (content.length === 0) content = item.find(SELECTOR_ACCORDION_ITEM_CONTENT);
            content.transition(0);
            content.css('height', content[0].scrollHeight + 'px');
            content[0].clientLeft;
            // Close
            content.transition('');
            content.css('height', '').transitionEnd(function() {
                content.transition(0);
                content.css('height', '');
                content.transition('');
                _acd.ref.trigger('closed', [item]);
            });
            _acd.ref.trigger('close', [item]);
            item.removeClass(CLASS_ACCORDION_ITEM_EXPANDED);
            $(item.children()[0]).removeClass(CLASS_ACCORDION_ITEM_LINK_EXPANDED);
        };


        //注册$插件
        $.fn.accordion = function(opts) {
            var accordionObjs = [];
            opts || (opts = {});
            this.each(function() {
                var accordionObj = null;
                var id = this.getAttribute('data-accordion');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    accordionObj = $ui.data[id] = new $accordion(opts);
                    this.setAttribute('data-accordion', id);
                } else {
                    accordionObj = $ui.data[id];
                }
                accordionObjs.push(accordionObj);
            });
            return accordionObjs.length > 1 ? accordionObjs : accordionObjs[0];
        };

        /*module.exports = function(opts){
            return new botton(opts);
        };
    */
    });
})();