/**
 * @file button组件
 */
(function() {

    //渲染组件
    var render = function(){
            
        };
     //绑定事件
    var bind = function(){
            var _btn = this, opts = _btn.opts;

            _btn.ref.on( _btn.touchEve() , function(evt) {
                var ele = evt.currentTarget;
                if ($.isFunction(_btn.callback)) {
                        _btn.callback.apply(_btn, [ele,evt]);
                    }
            });
        };


    define(function(require, exports, module) {
        var $ui = require("ui");

        //button
         var $button = $ui.define('Button',{});

        //初始化
        $button.prototype.init = function(){
            render.call(this);
            bind.call(this);
        };

        //注册$插件
        $.fn.button = function (callback) {
            var buttonObjs = [];

            this.each(function() {
                var buttonObj = null;
                var id = this.getAttribute('data-button');
                if (!id) {
                    opts = { ref : this,callback : callback};
                    id = ++$ui.uuid;
                    buttonObj = $ui.data[id] = new $button(opts);
                    this.setAttribute('data-button', id);
                } else {
                    buttonObj = $ui.data[id];
                }
                buttonObjs.push(buttonObj);
            });
            return buttonObjs.length > 1 ? buttonObjs : buttonObjs[0];
        };

        /*module.exports = function(opts){
            return new button(opts);
        };
    */
    });
})();
