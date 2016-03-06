/**
 * @file lazyLoadImage组件
 */
(function() {
    var imagesSequence = [];
    var imageIsLoading = false;
    var CLASS_LAZY = 'ui-lazy';

    var SELECTOR_LAZY = '.' + CLASS_LAZY;

    var render = function() {
        var _lli = this,
            opts = _lli.opts;
        _lli.pageContent = _lli.ref.find('.' + opts.lazyContent);
        if (_lli.pageContent.length === 0) return;
        _lli._lazyLoadImages = _lli.ref.find(SELECTOR_LAZY);
        if (_lli._lazyLoadImages.length === 0) return;
        _lli._lazyLoadImages.each(function() {
            if ($(this).data('src')) $(this).attr('src', opts.placeholderSrc);
            if ($(this).data('background')) $(this).css('background-image', 'url(' + opts.placeholderSrc + ')'); 
        });
        lazyHandler.call(_lli);
    };

    //绑定事件
    var bind = function() {
        var _lli = this;
        _lli.pageContent.on('scroll', $.proxy(lazyHandler, _lli));
        $(window).on('resize', $.proxy(lazyHandler, _lli));

    };

    var loadImage = function(el) {
        el = $(el);
        var bg = el.data('background');
        var src = bg ? bg : el.data('src');
        if (!src) return;

        function onLoad() {
            el[0].setAttribute('lazyLoaded', true);
            if (bg) {
                el.css('background-image', 'url(' + src + ')');
            } else {
                el.attr('src', src);
            }

            imageIsLoading = false;
            if (imagesSequence.length > 0) {
                loadImage(imagesSequence.shift());
            }
        }

        if (imageIsLoading) {
            if (imagesSequence.indexOf(el[0]) < 0) imagesSequence.push(el[0]);
            return;
        }

        // Loading flag
        imageIsLoading = true;

        var image = new Image();
        image.onload = onLoad;
        image.onerror = onLoad;
        image.src = src;
    }

    var lazyHandler = function() {
        var _lli = this;
        _lli._lazyLoadImages.each(function(index, el) {
            el = $(el);
            if (isElementInViewport(el[0])) {
                loadImage(el);
            }
        });
    }

    var isElementInViewport = function(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= (0) &&
            rect.left >= (0) &&
            rect.top <= (window.innerHeight) &&
            rect.left <= (window.innerWidth)
        );
    }

    define(function(require, exports, module) {
        var $ui = require("ui");

        //lazyLoadImage
        var $lazyLoadImage = $ui.define('LazyLoadImage', {
            placeholderSrc:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEXCwsK592mkAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==',
            lazyContent :'ui-lazy-loader-content'
        });

        //初始化
        $lazyLoadImage.prototype.init = function() {
            var _lli = this,
                opts = _lli.opts;
            render.call(_lli);
            bind.call(_lli);

        };
        //注册$插件
        $.fn.lazyloadimage = function(opts) {
            var lazyLoadImageObjs = [];
            opts || (opts = {});
            this.each(function() {
                var lazyLoadImageObj = null;
                var id = this.getAttribute('data-lazyLoadImage');
                if (!id) {
                    opts = $.extend(opts, {
                        ref: this
                    });
                    id = ++$ui.uuid;
                    lazyLoadImageObj = $ui.data[id] = new $lazyLoadImage(opts);
                    this.setAttribute('data-lazyLoadImage', id);
                } else {
                    lazyLoadImageObj = $ui.data[id];
                }
                lazyLoadImageObjs.push(lazyLoadImageObj);
            });
            return lazyLoadImageObjs.length > 1 ? lazyLoadImageObjs : lazyLoadImageObjs[0];
        };

        /*module.exports = function(opts){
            return new botton(opts);
        };
    */
    });
})();