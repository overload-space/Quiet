"undefined" == typeof(element_block_js) && !function() {
    window.element_block_js = "element_block_js";
    function elementBlock() {
        var color = {};
        color.i = 1;
        color.c = "#000080";

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
    }
}();