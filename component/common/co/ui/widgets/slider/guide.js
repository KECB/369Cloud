/**
 * @file 图片轮播剪头按钮
 */
(function() {
    

    /**
     * 图片轮播剪头按钮
     */
    define(function(require, exports, module) {
        var sGuide = function(){
            var _sl = this, opts = _sl.opts,
                arr = [ 'prev', 'next' ];

             $.extend(true, opts, {
                    tpl: {
                        prev: '<span class="ui-slider-pre"></span>',
                        next: '<span class="ui-slider-next"></span>'
                    },

                    /**
                     * @property {Object} [select={prev:'.ui-slider-pre',next:'.ui-slider-next'}] 上一张和下一张按钮的选择器
                     * @namespace options
                     * @for Slider
                     * @uses Slider.arrow
                     */
                    selector: {
                        prev: '.ui-slider-pre',    // 上一张按钮选择器
                        next: '.ui-slider-next'    // 下一张按钮选择器
                    }
                });

            

                var selector = opts.selector;

                arr.forEach(function( name ) {
                    var item = _sl.ref.find( selector[ name ] );
                    item.length || _sl.ref.append( item = $( opts.tpl[name]));
                    _sl[ '_' + name ] = item;
                });

                arr.forEach(function( name ) {
                    _sl[ '_' + name ].on( _sl.touchEve(), function() {
                        _sl[ name ].call( _sl );
                    } );
                });

                _sl.ref.on( 'destroy', function() {
                    _sl._prev.off();
                    _sl._next.off();
                } );
        }
        module.exports = sGuide;
    });
})();