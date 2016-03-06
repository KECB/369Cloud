/**
 * @file photoBrowser 组件
 */
(function($, window, undefined) {
    var animationEnd = $.fx.animationEnd;

    var CLASS_PHOTO_BROWSER = 'ui-photo-browser',
        CLASS_PHOTO_BROWSER_LIGHT = 'ui-photo-browser-light',
        CLASS_PHOTO_BROWSER_IN = 'ui-photo-browser-in',
        CLASS_PHOTO_BROWSER_OUT = 'ui-photo-browser-out',
        CLASS_PHOTO_BROWSER_CONTAINER = 'ui-photo-browser-container',
        CLASS_PHOTO_BROWSER_NAVBAR = 'ui-photo-browser-navbar',
        CLASS_NAVBAR_CENTER = 'ui-navbar-center',
        CLASS_PHOTO_BROWSER_CURRENT = 'ui-photo-browser-current',
        CLASS_PHOTO_BROWSER_TOTAL = 'ui-photo-browser-total',
        CLASS_PHOTO_BROWSER_TOOLBAR = 'ui-photo-browser-toolbar',
        CLASS_TOOLBAR_LINK = 'ui-toolbar-link',
        CLASS_ICON_PREV = 'ui-icon-prev',
        CLASS_ICON_NEXT = 'ui-icon-next',
        CLASS_PHOTO_BROWSER_CAPTIONS = 'ui-photo-browser-captions',
        CLASS_PHOTO_BROWSER_CAPTION = 'ui-photo-browser-caption',
        CLASS_SLIDER = 'ui-slider',
        CLASS_SLIDER_GROUP = 'ui-slider-group',
        CLASS_SLIDER_IMG = 'ui-slider-img',
        CLASS_SLIDER_ITEM = 'ui-slider-item',
        CLASS_PHOTO_BROWSER_CLOSE = 'ui-photo-browser-close',
        CLASS_PHOTO_BROWSER_BACK = 'ui-photo-browser-back',
        CLASS_PHOTO_BROWSER_LINK_INACTIVE = 'ui-photo-browser-link-inactive',
        CLASS_PHOTO_BROWSER_CAPTION_ACTIVE = 'ui-photo-browser-caption-active',
        CLASS_PHOTO_BROWSER_EXPOSED = 'ui-photo-browser-exposed';



    var SELECTOR_PHOTO_BROWSER = '.' + CLASS_PHOTO_BROWSER,
        SELECTOR_PHOTO_BROWSER_CONTAINER = '.' + CLASS_PHOTO_BROWSER_CONTAINER,
        SELECTOR_PHOTO_BROWSER_CURRENT = '.' + CLASS_PHOTO_BROWSER_CURRENT,
        SELECTOR_PHOTO_BROWSER_TOTAL = '.' + CLASS_PHOTO_BROWSER_TOTAL,
        SELECTOR_SLIDER = '.' + CLASS_SLIDER,
        SELECTOR_SLIDER_GROUP = '.' + CLASS_SLIDER_GROUP,
        SELECTOR_PHOTO_BROWSER_CLOSE = '.' + CLASS_PHOTO_BROWSER_CLOSE,
        SELECTOR_ICON_PREV = '.' + CLASS_ICON_PREV,
        SELECTOR_ICON_NEXT = '.' + CLASS_ICON_NEXT,
        SELECTOR_TOOLBAR_LINK = '.' + CLASS_TOOLBAR_LINK,
        SELECTOR_SLIDER_IMG = '.' + CLASS_SLIDER_IMG,
        SELECTOR_SLIDER_ITEM = '.' + CLASS_SLIDER_ITEM;

    var navbar = '<div class="' + CLASS_PHOTO_BROWSER_NAVBAR + '"> ' +
        '<div> <a class="' + CLASS_PHOTO_BROWSER_CLOSE + '"><i class="' + CLASS_PHOTO_BROWSER_BACK + '"></i><span>Close</span></a></div> ' +
        '<div class = "' + CLASS_NAVBAR_CENTER + '"> ' +
        '<span class = "' + CLASS_PHOTO_BROWSER_CURRENT + '">  </span> ' +
        '<span style="margin: 0 5px;">/ </span> ' +
        '<span class="' + CLASS_PHOTO_BROWSER_TOTAL + '"></span> ' +
        '</div> <div> ' +
        '</div> ' +
        '</div>';
    var toolbar = '<div class="' + CLASS_PHOTO_BROWSER_TOOLBAR + '">' +
        '<a class="' + CLASS_TOOLBAR_LINK + '">' +
        '<i class="' + CLASS_ICON_PREV + '"></i>' +
        '</a>' +
        '<a class="' + CLASS_TOOLBAR_LINK + '">' +
        '<i class="' + CLASS_ICON_NEXT + '"></i>' +
        '</a>' +
        '</div>';
    var captions = '<div class="' + CLASS_PHOTO_BROWSER_CAPTIONS + '"></div>';
    var caption = '<div class="' + CLASS_PHOTO_BROWSER_CAPTION + '" ><%=cont%></div>';

    var sliderWapll = '<div class="' + CLASS_SLIDER + '"><div class="' + CLASS_SLIDER_GROUP + '"></div></div>'
        //渲染组件
    var render = function() {
        var _pb = this,
            opts = _pb.opts,
            items;
        opts.light && _pb.ref.addClass(CLASS_PHOTO_BROWSER_LIGHT);
        _pb._navbar = $(navbar).appendTo(_pb.ref);
        _pb._toolbar = $(toolbar).appendTo(_pb.ref);
        _pb._container = _pb.ref.find(SELECTOR_PHOTO_BROWSER_CONTAINER);
        _pb.length = (items = _pb._container.children()).length;
        _pb._current = _pb._navbar.find(SELECTOR_PHOTO_BROWSER_CURRENT);
        _pb._current.html(opts.index + 1);
        _pb._total = _pb._navbar.find(SELECTOR_PHOTO_BROWSER_TOTAL);
        _pb._total.html(_pb.length);

        _pb._slider = $(sliderWapll).appendTo(_pb._container);
        items.appendTo(_pb._slider.find(SELECTOR_SLIDER_GROUP));
        _pb.ref.on(animationEnd, function() {
            _pb._container.css('display', 'block');
            _pb.slider = _pb._slider.slider(opts);
            _pb._current.html(opts.index + 1);
            if (opts.index == 0) {
                _pb._toolbar.find(SELECTOR_ICON_PREV).parent().addClass(CLASS_PHOTO_BROWSER_LINK_INACTIVE);
            } else if (opts.index == (_pb.length - 1)) {
                _pb._toolbar.find(SELECTOR_ICON_NEXT).parent().addClass(CLASS_PHOTO_BROWSER_LINK_INACTIVE);
            }
        });
        initCaptions.call(_pb);
    };
    //绑定事件
    var bind = function() {
        var _pb = this,
            opts = _pb.opts,
            canTap = true;
        _pb._toolbar.find(SELECTOR_ICON_PREV).parent().on(_pb.touchEve(), function(evt) {
            _pb.slider.prev();
        });
        _pb._toolbar.find(SELECTOR_ICON_NEXT).parent().on(_pb.touchEve(), function(evt) {
            _pb.slider.next();
        });
        _pb._slider.on('slide', function(evt, to, from) {
            _pb._current.html(to + 1);
            opts.index = to;
            if (to == 0) {
                _pb._toolbar.find(SELECTOR_ICON_PREV).parent().addClass(CLASS_PHOTO_BROWSER_LINK_INACTIVE);
            } else if (to == (_pb.length - 1)) {
                _pb._toolbar.find(SELECTOR_ICON_NEXT).parent().addClass(CLASS_PHOTO_BROWSER_LINK_INACTIVE);
            } else {
                _pb._toolbar.find(SELECTOR_TOOLBAR_LINK).removeClass(CLASS_PHOTO_BROWSER_LINK_INACTIVE);
            }
            _pb._captions[to] && (_pb._captions.removeClass(CLASS_PHOTO_BROWSER_CAPTION_ACTIVE) && $(_pb._captions[to]).addClass(CLASS_PHOTO_BROWSER_CAPTION_ACTIVE));
        });
        _pb._navbar.find(SELECTOR_PHOTO_BROWSER_CLOSE).on(_pb.touchEve(), function(evt) {
            _pb.close();
        });
        _pb._slider.find(SELECTOR_SLIDER_IMG).on('singleTap', function(evt) {
            if (!canTap) return;
            canTap = false;
            _pb._slider.find(SELECTOR_SLIDER_ITEM).css('transition-duration', '400ms');
            _pb.ref.toggleClass(CLASS_PHOTO_BROWSER_EXPOSED);
            canTap = true;
        })
    };

    var initCaptions = function() {
        var _pb = this,
            opts = _pb.opts;
        if (opts.captions.length > 0) {
            _pb._caption = $(captions).appendTo(_pb.ref);
            _pb._captionparseFn || (_pb._captionparseFn = _pb.parseTpl(caption));
            var caps = [];
            var item = {};
            $.each(opts.captions, function(index, el) {
                item.cont = el;
                caps[index] = _pb._captionparseFn(item);
            })
            _pb._captions = $(caps.join('')).appendTo(_pb._caption);
            _pb._captions[opts.index] && $(_pb._captions[opts.index]).addClass(CLASS_PHOTO_BROWSER_CAPTION_ACTIVE);

        }
    }


    define(function(require, exports, module) {
        var $ui = require("ui");
        require("slider");
        //photoBrowser
        var $photoBrowser = $ui.define('PhotoBrowser', {
            /**
             * @property {Boolean} [loop=false] 是否连续滑动
             * @namespace options
             */
            loop: false,

            /**
             * @property {Number} [speed=400] 动画执行速度
             * @namespace options
             */
            speed: 400,

            /**
             * @property {Number} [index=0] 初始位置
             * @namespace options
             */
            index: 0,
            gestur: true,
            captions: [],
            light: false,
            space: 10

        });

        //初始化
        $photoBrowser.prototype.init = function() {
            render.call(this);
            bind.call(this);
        };

        $.extend($photoBrowser.prototype, {
            open: function(index) {
                this.ref.removeClass(CLASS_PHOTO_BROWSER_OUT).addClass(CLASS_PHOTO_BROWSER_IN);
                this.moveTo(index);
                return this;
            },
            moveTo:function(next){
                var _pb = this,
                    opts = _pb.opts;
                if ($.chk(next)) {
                    if ($.chk(_pb.slider)) {
                        _pb.slider.slideTo(next);
                    } else {
                        opts.index = next;
                        _pb._captions[next] && (_pb._captions.removeClass(CLASS_PHOTO_BROWSER_CAPTION_ACTIVE) && $(_pb._captions[next]).addClass(CLASS_PHOTO_BROWSER_CAPTION_ACTIVE));
                    }
                }
                return this;
            },
            prev: function() {
                this.slider.prev();
                return this;
            },
            next: function() {
                this.slider.next();
                return this;
            },
            close: function() {
                this.ref.removeClass(CLASS_PHOTO_BROWSER_IN).addClass(CLASS_PHOTO_BROWSER_OUT);
                return this;
            }
        });

        //注册$插件
        $.fn.photobrowser = function(opts) {
            var photoBrowserObjs = [];
            opts || (opts = {});
            this.each(function() {
                var photoBrowserObj = null;
                var id = this.getAttribute('data-photoBrowser');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    photoBrowserObj = $ui.data[id] = new $photoBrowser(opts);
                    this.setAttribute('data-photoBrowser', id);
                } else {
                    photoBrowserObj = $ui.data[id];
                }
                photoBrowserObjs.push(photoBrowserObj);
            });
            return photoBrowserObjs.length > 1 ? photoBrowserObjs : photoBrowserObjs[0];
        };

        /*module.exports = function(opts){
            return new button(opts);
        };
    */
    });
})(Dom, window);