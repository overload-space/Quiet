/**
 * Created by jcx on 16/3/4.
 */

"undefined" == typeof(element_block_js) && !function() {
    window.element_block_js = "element_block_js";
    function elementBlock() {
        var self = this;
        /**
         *  idle: 0
         *  select: 1    wait for user to move mouse and click
         *  adjust: 2    user sue panel to get biger and small area
         */
        var EBSTATE_IDLE = 0, EBSTATE_SELECT = 1, EBSTATE_ADJUST = 2;
        var mode = EBSTATE_IDLE;
        var onObj;
        var color = {};
        color.i = 1;
        color.c = "#000080";

        var lastmouse = {};


        document.addEventListener('mousemove', function (e) {
            if (mode !== EBSTATE_SELECT) {
                return;
            }

            if (lastmouse.x == e.clientX && lastmouse.y == e.clientY) {
                return;
            }

            clearBlock();

            var x = e.clientX, y = e.clientY;
            var elementMouseIsOver = document.elementFromPoint(x, y);

            showEBlock(elementMouseIsOver);
            lastmouse.x = e.clientX;
            lastmouse.y = e.clientY;
            onObj = elementMouseIsOver;

            return false;
        }, true);

        function clearBlock() {
            jQuery('jQueryClone' + color.i).remove();
        }

        function showEBlock(obj) {
            if (obj == document) {
                console.log("hover is document");
                return;
            }
            if (obj == undefined) {
                console.log("element is undefined");
                return;
            }

            if (!jQuery('#jqueryClones').length) {
                jQuery("<div id='jqueryClones'></div>").appendTo('body');
            }

            console.log(obj);

            var offset = jQuery(obj).offset();
            jQuery('<jQueryClone' + color.i + '></jQueryClone' + color.i + '>')
                .css({
                    width: jQuery(obj).outerWidth(),
                    height: jQuery(obj).outerHeight(),
                    top: offset.top - 3,
                    left: offset.left - 3,
                    position: 'absolute',
                    zIndex: 99999999999999999,
                    opacity: 0.3,
                    background: color.c,
                    border: '0px dashed white'
                }).appendTo('#jqueryClones');

        }

        document.addEventListener('click', function (e) {
            if (mode == EBSTATE_SELECT) {
                mode = EBSTATE_ADJUST;

                /*  TODO: show a new adjust panel    */
                self.adjustState(onObj);

                e.stopPropagation();
                e.preventDefault();
                return;
            }
        }, true);

        document.addEventListener("keyup", function (e) {
            if (e.keyCode == 27 && mode == EBSTATE_SELECT) {
                mode = EBSTATE_IDLE;
                clearBlock();
                ShowBNPanel();
                return
            }
        });

        this.clearEBlock = function () {
            jQuery('jQueryClone' + color.i).remove();
        };

        this.activate = function () {
            mode = EBSTATE_SELECT;
            HideBNPanel();
        };

        this.adjustState = function () {
            clearBlock();
            ShowBNAdjustPanel(onObj);
        };

        this.adjustMessageHandler = function (msg) {
            if (msg.cmd == "zoomdown") {
                RemoveBNAdjustPanel();
                onObj = childNode(onObj);
                ShowBNAdjustPanel(onObj);
            } else if (msg.cmd == "zoomup") {
                RemoveBNAdjustPanel();
                onObj = parentNode(onObj);
                ShowBNAdjustPanel(onObj);
            } else if (msg.cmd === "presibling") {
                RemoveBNAdjustPanel();
                onObj = getSibling(onObj, 0);
                ShowBNAdjustPanel(onObj);
            } else if (msg.cmd === "nextsibling") {
                RemoveBNAdjustPanel();
                onObj = getSibling(onObj, 1);
                ShowBNAdjustPanel(onObj);
            } else if (msg.cmd == "finish") {
                RemoveBNAdjustPanel();
                var sobj = GenerateObject.generateObject(onObj);
                sobj.name = msg.name;
                getSelectionData(sobj);
                ShowBNPanel();
            } else if (msg.cmd == "cancel") {
                RemoveBNAdjustPanel();
                ShowBNPanel();
            }

        };

        function parentNode(obj) {
            if (obj.tagName.toLowerCase() == "body" && obj.tagName.toLowerCase() == "html") {
                return obj;
            }

            if (obj.parentNode.tagName.toLowerCase() == "body") {
                return obj;
            }
            return obj.parentNode;
        }

        function childNode(obj) {
            var objnext;
            var originobj;
            if (obj.firstElementChild == null) {
                return obj;
            }
            originobj = objnext = obj.firstElementChild;
            while (objnext.offsetHeight == 0 && objnext.offsetHeight == 0) {
                objnext = iterSibling(objnext);
                if (objnext == originobj) {
                    return obj;
                }
            }

            return objnext;
        }

        function iterSibling(obj, mode) {
            var objnext;
            if (mode === 0) {
                if (obj.previousElementSibling === null) {
                    objnext = obj.parentNode.firstElementChild;
                } else {
                    objnext = obj.previousElementSibling;
                }
            } else if (mode === 1) {
                if (obj.nextElementSibling == null) {
                    objnext = obj.parentNode.firstElementChild;
                } else {
                    objnext = obj.nextElementSibling;
                }
            }
            return objnext;
        }

        // mode ==  0, get pre; mode == 1, get next
        function getSibling(obj, mode) {
            var originobj = obj;
            var objnext = iterSibling(obj, mode);
            /*  offsetHeight/ofsetWidth maybe number or undefined */
            while (!(objnext.offsetHeight > 0) || !(objnext.offsetWidth > 0)) {
                objnext = iterSibling(objnext);
                if (objnext == originobj)
                    break;
            }

            return objnext;
        }

        //Object.preventExtensions(this);
        return;
    }


    window.eBlock = new elementBlock();

}();