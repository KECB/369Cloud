/**
 * @file 图片轮播手指缩放插件
 */
(function() {
    var bWidth,
        bHeight,
        bScrollLeft,
        bScrollTop,
        target,
        targetImg;


    var gesturestart = function(e) {
        var _gt = this;
        target = _gt._items[_gt.index];
        targetImg = $(target).find('.ui-slider-img');
        bWidth = targetImg.width();
        bHeight = targetImg.height();
        bScrollLeft = $(target).scrollLeft();
        bScrollTop = $(target).scrollTop();
        var scale = e.scale;
        _gt.ref.on('gesturechange ' + ' gestureend', _gt._gestureHandler);
    };


    var gesturechange = function(e) {
        // 多指或缩放不处理
        var _gt = this,
            opts = _gt.opts,
            scale = e.scale;
        $(target).css('overflow', 'hidden');
        if (1 < scale && scale < 2) {
            target.isMax = true;
            var ratio = scale - 1;
            var mWidth = bWidth + opts.MaxWidthPx * ratio;
            var mHeight = targetImg[0].sHeight / targetImg[0].sWidth * mWidth;
            if ((mWidth) < (targetImg[0].sWidth + opts.MaxWidthPx)) {
                targetImg.css('width', mWidth)
                target.scrollLeft = bScrollLeft + (mWidth - bWidth) / 2
                targetImg.css('height', mHeight)
                target.scrollTop = bScrollTop + (mHeight - bHeight) / 2
            } else {
                targetImg.css('width', targetImg[0].sWidth + opts.MaxWidthPx);
                target.scrollLeft = bScrollLeft + (targetImg[0].sWidth + opts.MaxWidthPx - bWidth) / 2;
                targetImg.css('height', (targetImg[0].sHeight / targetImg[0].sWidth) * (targetImg[0].sWidth + opts.MaxWidthPx))
                target.scrollTop = bScrollTop + ((targetImg[0].sHeight / targetImg[0].sWidth) * (targetImg[0].sWidth + opts.MaxWidthPx) - bHeight) / 2
            }
            _gt.ref.off('touchstart ' + 'touchmove' + ' touchend' + ' touchcancel',
                _gt._touchHandler);
        } else if (scale < 1) {
            var ratio = 1 - scale;
            var mWidth = bWidth - opts.MaxWidthPx * ratio;
            var mHeight = targetImg[0].sHeight / targetImg[0].sWidth * mWidth;

            if (mWidth > (targetImg[0].sWidth)) {
                targetImg.css('width', mWidth)
                target.scrollLeft = (bScrollLeft - (bWidth - mWidth) / 2) > 0 ? bScrollLeft - (bWidth - mWidth) / 2 : 0
                targetImg.css('height', mHeight)
                target.scrollTop = (bScrollTop - (bHeight - mHeight) / 2) > 0 ? bScrollTop - (bHeight - mHeight) / 2 : 0
                    // _gt.ref.find('.ui-slider-dots').html(target.scrollLeft + "  " + target.scrollTop)
            } else {
                target.isMax = false;
                targetImg.css('width', targetImg[0].sWidth)
                targetImg.css('height', targetImg[0].sHeight)
                target.scrollLeft = 0;
                target.scrollTop = 0;
                $(target).css('overflow', 'hidden');
                _gt.ref.on('touchstart', _gt._touchHandler);
            }

        }

    };

    var gestureend = function() {
        var _gt = this,
            opts = _gt.opts;
        if (target.isMax) $(target).css('overflow', 'scroll');
        // 解除事件
        _gt.ref.off('gesturechange ' + 'gestureend',
            _gt._gestureHandler);


    };



    /**
     * 图片轮播手指跟随插件
     * @pluginfor Slider
     */
    define(function(require, exports, module) {

        var gestures = function() {
            var _gt = this,
                opts = _gt.opts;

            // 提供默认options
            $.extend(true, opts, {

                /**
                 * @property 宽度放大的最大PX值
                 * @namespace options
                 * @for Slider
                 * @uses 
                 */
                MaxWidthPx: 500
            });

            _gt._gestureHandler = function(e) {
                opts.stopPropagation && e.stopPropagation();
                switch (e.type) {
                    case 'gesturestart':
                        gesturestart.call(_gt, e);
                        break;
                    case 'gesturechange':
                        gesturechange.call(_gt, e);
                        break;
                    case 'gestureend':
                        gestureend.call(_gt, e);
                        break;
                }
            };
            // 绑定手势
            _gt.ref.on('gesturestart', _gt._gestureHandler);

            $.each(_gt._items, function(i, item) {
                var img = $(item).find('.ui-slider-img');
                img[0].sWidth = img.width();
                img.css('transform', 'translate3d(0, 0, 0)');
                img[0].sHeight = img.height();
            });

            _gt.ref.find('.ui-slider-img').on('doubleTap', function(e) {
                target = _gt._items[_gt.index];
                targetImg = $(target).find('.ui-slider-img');
                bWidth = targetImg.width();
                bHeight = targetImg.height();
                if (!target.isMax) {
                    target.isMax = true;
                    $(target).css('overflow', 'scroll');
                    targetImg.css('width', targetImg[0].sWidth + opts.MaxWidthPx);
                    target.scrollLeft = target.scrollLeft + (targetImg[0].sWidth + opts.MaxWidthPx - bWidth) / 2;
                    targetImg.css('height', (targetImg[0].sHeight / targetImg[0].sWidth) * (targetImg[0].sWidth + opts.MaxWidthPx))
                    target.scrollTop = target.scrollTop + ((targetImg[0].sHeight / targetImg[0].sWidth) * (targetImg[0].sWidth + opts.MaxWidthPx) - bHeight) / 2

                    _gt.ref.off('touchstart ' + 'touchmove' + ' touchend' + ' touchcancel',
                        _gt._touchHandler);
                } else {
                    target.isMax = false;
                    targetImg.css('width', targetImg[0].sWidth)
                    targetImg.css('height', targetImg[0].sHeight)
                    target.scrollLeft = 0;
                    target.scrollTop = 0;
                    $(target).css('overflow', 'hidden');
                    _gt.ref.on('touchstart', _gt._touchHandler);
                }
            });

        };
        module.exports = gestures;
    });
})();