/**
 * @file 下拉列表控件
 */
(function() {

     //渲染
        var render = function(){
            
        };

        //绑定事件
        var bind = function(){
            var _sel = this, opts = _sel.opts;
             _sel.ref.find('select').on("change", function(evt) {
                var ele = evt.currentTarget;
                selectChange(ele);
                if ($.isFunction(_sel.callback)) {
                    _sel.callback.apply(_sel, [ele,evt]);
                }
            });
        };

        /*
         下拉列表控件
         @param ELE id 下拉列表select标签的对象

         */
        var selectChange = function(sel) {
            if (sel) {
                var sp = sel.parentElement;
                //<span>
                if (sp) {
                    var ch = sp.getElementsByTagName('div')[0];
                    var t = sel.options[sel.selectedIndex].text;
                    if (ch) {
                        $(ch).html(t);
                    }
                }
            }
        };

    define(function(require, exports, module) {
        var $ui = require("ui");

        //Select
        var $select = $ui.define('Select',{});

        //初始化
        $select.prototype.init = function(){
            render.call(this);
            bind.call(this);
        };


        //注册$插件
        $.fn.select = function (callback) {
            var selectObjs = [];
            this.each(function() {
                var selectObj = null;
                var id = this.getAttribute('data-select');
                if (!id) {
                    opts = { ref : this,callback:callback};
                    id = ++$ui.uuid;
                    selectObj = $ui.data[id] = new $select(opts);
                    this.setAttribute('data-select', id);
                } else {
                    selectObj = $ui.data[id];
                }
                selectObjs.push(selectObj);
            });
            return selectObjs.length > 1 ? selectObjs : selectObjs[0];
        };

        /*module.exports = function(opts){
            return new checkbox(opts);
        };
    */
    });
})();
