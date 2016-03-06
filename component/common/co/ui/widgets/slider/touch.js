/**
 * @file 图片轮播手指跟随插件
 * @import slider.js
 */
(function() {
    
    var isScrolling,
        touchesStart,
        touchesEnd,
        delta,
        moved;

        var sliderTonClick = function() {
                return !moved;
            };
        var angle = function(start,end){
                var diff_x = end.x - start.x,
                    diff_y = end.y - start.y;
                //返回角度,不是弧度
                return 360*Math.atan(diff_y/diff_x)/(2*Math.PI);
        }

        var sliderTonStart = function( e ) {
                    
                // 不处理多指
                if ( e.touches.length > 1 ) {
                    return false;
                }

                var _sl = this,
                    touche = e.touches[ 0 ],
                    opts = _sl.opts,
                    num;

                touchesStart = {
                    x: touche.pageX,
                    y: touche.pageY,
                    time: +new Date()
                };

                delta = {};
                moved = false;
                isScrolling = undefined;

                num = opts.mulViewNum || 1;
                _sl.move( opts.loop ? _sl.circle( _sl.index - num ) :
                        _sl.index - num, -_sl.width, 0, true );
                _sl.move( opts.loop ? _sl.circle( _sl.index + num ) :
                        _sl.index + num, _sl.width, 0, true );

                _sl.ref.on( 'touchmove' + ' touchend' +
                        ' touchcancel', _sl._touchHandler );
            };


        var sliderTonMove = function( e ) {
                // 多指或缩放不处理
                if ( e.touches.length > 1 || e.scale &&
                        e.scale !== 1 ) {
                    return false;
                }

                var _sl = this,
                    opts = _sl.opts,
                    viewNum = opts.mulViewNum || 1,
                    touche = e.touches[ 0 ],
                    index = _sl.index,
                    i,
                    len,
                    pos,
                    slidePos;

                opts.disableScroll && e.preventDefault();
                touchesEnd = {
                    x: touche.pageX,
                    y: touche.pageY
                }
                if(Math.abs(angle(touchesStart,touchesEnd)) > 30)return;
                
                co.verticalSwipe = false;
                delta.x = touche.pageX - touchesStart.x;
                delta.y = touche.pageY - touchesStart.y;
                if ( typeof isScrolling === 'undefined' ) {
                    isScrolling = Math.abs( delta.x ) <
                            Math.abs( delta.y );
                }

                if ( !isScrolling ) {
                    e.preventDefault();

                    if ( !opts.loop ) {

                        // 如果左边已经到头
                        delta.x /= (!index && delta.x > 0 ||

                                // 如果右边到头
                                index === _sl._items.length - 1 && 
                                delta.x < 0) ?

                                // 则来一定的减速
                                (Math.abs( delta.x ) / _sl.width + 1) : 1;
                    }

                    slidePos = _sl._slidePos;

                    for ( i = index - viewNum, len = index + 2 * viewNum;
                            i < len; i++ ) {
                        pos = opts.loop ? _sl.circle( i ) : i;
                        _sl.translate( pos, delta.x + slidePos[ pos ], 0 );
                    }

                    moved = true;
                }
            };

        var sliderTonEnd = function() {
                co.verticalSwipe = true;
                var _sl = this,
                    opts = _sl.opts;
                // 解除事件
                _sl.ref.off( 'touchmove' + ' touchend' + ' touchcancel',
                        _sl._touchHandler );

                if ( !moved ) {
                    return;
                }

                var viewNum = opts.mulViewNum || 1,
                    index = _sl.index,
                    slidePos = _sl._slidePos,
                    duration = +new Date() - touchesStart.time,
                    absDeltaX = Math.abs( delta.x ),

                    // 是否滑出边界
                    isPastBounds = !opts.loop && (!index && delta.x > 0 ||
                        index === slidePos.length - viewNum && delta.x < 0),

                    // -1 向右 1 向左
                    dir = delta.x > 0 ? 1 : -1,
                    speed,
                    diff,
                    i,
                    len,
                    pos;

                if ( duration < 250 ) {

                    // 如果滑动速度比较快，偏移量跟根据速度来算
                    speed = absDeltaX / duration;
                    diff = Math.min( Math.round( speed * viewNum * 1.2 ),
                            viewNum );
                } else {
                    diff = Math.round( absDeltaX / (_sl.perWidth || _sl.width) );
                }
                
                if ( diff && !isPastBounds ) {
                    _sl.slide( index, diff, dir, _sl.width, opts.speed,
                            opts, true );
                    
                    // 在以下情况，需要多移动一张
                    if ( viewNum > 1 && duration >= 250 &&
                            Math.ceil( absDeltaX / _sl.perWidth ) !== diff ) {

                        _sl.index < index ? _sl.move( _sl.index - 1, -_sl.perWidth,
                                opts.speed ) : _sl.move( _sl.index + viewNum,
                                _sl.width, opts.speed );
                    }
                } else {
                    if((_sl.index == 0 && dir == 1) || (_sl.index == (_sl.length - 1) && dir == -1)){//左右滑到尽头
                        (!opts.loop) && _sl.ref.trigger('moveend', [_sl.index,dir]);
                    }
                    // 滑回去
                    for ( i = index - viewNum, len = index + 2 * viewNum;
                        i < len; i++ ) {

                        pos = opts.loop ? _sl.circle( i ) : i;
                        _sl.translate( pos, slidePos[ pos ], 
                                opts.speed );
                    }
                }
        };

    

    /**
     * 图片轮播手指跟随插件
     * @pluginfor Slider
     */
    define(function(require, exports, module) {
       
        var sTouch =  function() {
                var _sl = this, opts = _sl.opts;

                 // 提供默认options
                $.extend(true, opts, {

                    /**
                     * @property {Boolean} [stopPropagation=false] 是否阻止事件冒泡
                     * @namespace options
                     * @for Slider
                     * @uses Slider.touch
                     */
                    stopPropagation: false,

                    /**
                     * @property {Boolean} [disableScroll=false] 是否阻止滚动
                     * @namespace options
                     * @for Slider
                     * @uses Slider.touch
                     */
                    disableScroll: false
                });

                _sl._touchHandler = function( e ) {
                    opts.stopPropagation && e.stopPropagation();
                    switch (e.type) {
                        case 'touchstart':
                            sliderTonStart.call(_sl,e);
                            break;
                        case 'touchmove':
                            sliderTonMove.call(_sl,e);
                            break;
                        case 'touchcancel':
                        case 'touchend':
                            sliderTonEnd.call(_sl,e);
                            break;
                        case 'click':
                            sliderTonClick.call(_sl,e);
                            break;
                    }
                };
                // 绑定手势
                _sl.ref.on( 'touchstart', _sl._touchHandler);
                    
            };
        module.exports = sTouch;
    } );
})();