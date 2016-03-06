/**
 * 图片轮播多图显示功能
 */
(function() {
    var $slider
     /**
     * 图片轮播多图显示功能
     */
    define(function(require, exports, module) {
        var $ui = require("ui");
        $slider = $ui['Slider'];
        var sMultiview = function(){
            var _sl = this, opts = _sl.opts;

            _sl.arrange = function() {
                var items = _sl._items,
                    viewNum = opts.mulViewNum,
                    factor = _sl.index % viewNum,
                    i = 0,
                    perWidth = _sl.perWidth = Math.ceil( _sl.width / viewNum ),
                    item,
                    len;

                _sl._slidePos = new Array( items.length );

                for ( len = items.length; i < len; i++ ) {
                    item = items[ i ];

                    item.style.cssText += 'width:' + perWidth + 'px;' +
                            'left:' + (i * -perWidth) + 'px;';
                    item.setAttribute( 'data-index', i );

                    i % viewNum === factor && _sl.move( i,
                            i < _sl.index ? -_sl.width : i > _sl.index ? _sl.width : 0,
                            0, Math.min( viewNum, len - i ) );
                }

                _sl._container.css( 'width', perWidth * len );
            };

            _sl.move = function( index, dist, speed, immediate, count ) {
                var _sl = this, opts = _sl.opts,
                    perWidth = _sl.perWidth,
                    i = 0;

                count = count || opts.mulViewNum;

                for ( ; i < count; i++ ) {
                    $slider.prototype.move.apply(_sl, [opts.loop ? _sl.circle( index + i ) :
                            index + i, dist + i * perWidth, speed, immediate ]);
                }
            };

            _sl.slide = function( from, diff, dir, width, speed, opts, mode ) {
                var _sl = this, opts = _sl.opts,
                    viewNum = opts.mulViewNum,
                    len = this._items.length,
                    offset,
                    to;

                // 当不是loop时，diff不能大于实际能移动的范围
                opts.loop || (diff = Math.min( diff, dir > 0 ?
                                from : len - viewNum - from ));

                to = _sl.circle( from - dir * diff );

                // 如果不是loop模式，以实际位置的方向为准
                opts.loop || (dir = Math.abs( from - to ) / (from - to));

                diff %= len;    // 处理diff大于len的情况

                // 相反的距离比viewNum小，不能完成流畅的滚动。
                if ( len - diff < viewNum ) {
                    diff = len - diff;
                    dir = -1 * dir;
                }

                offset = Math.max( 0, viewNum - diff );

                // 调整初始位置，如果已经在位置上不会重复处理
                // touchend中执行过来的，不会执行以下代码
                if ( !mode ) {
                    _sl.move( to, -dir * this.perWidth *
                            Math.min( diff, viewNum ), 0, true );
                    _sl.move( from + offset * dir, offset * dir *
                            this.perWidth, 0, true );
                }

                _sl.move( from + offset * dir, width * dir, speed );
                _sl.move( to, 0, speed );

                _sl.index = to;
                _sl.ref.trigger('slide', [to,from]);
                return _sl;
            };

            _sl.prev = function() {
                var _sl = this, to, opts = _sl.opts;
                    travelSize = opts.travelSize;

                if ( opts.loop || (_sl.index > 0, travelSize =
                        Math.min( _sl.index, travelSize )) ) {

                    _sl.slideTo( _sl.index - travelSize );
                }

                return _sl;
            };

            _sl.next = function() {
                var _sl = this, opts = _sl.opts;
                    travelSize = opts.travelSize,
                    viewNum = opts.mulViewNum;

                if ( opts.loop || (_sl.index + viewNum < _sl.length &&
                        (travelSize = Math.min( _sl.length - 1 - _sl.index,
                        travelSize ))) ) {

                    _sl.slideTo( _sl.index + travelSize );
                }

                return _sl;
            };
        };
        module.exports = sMultiview;
    });
}())