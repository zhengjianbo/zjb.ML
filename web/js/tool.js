/** layuiAdmin.std-v1.0.0 LPPL License By http://www.layui.com/admin/ */;
layui.define(['layer', 'laypage'], function (e) {
    var $ = layui.jquery = layui.$;

    e('tool', {
        Weburl: 'http://localhost:1900',
        loadData: function (jsonStr, ctl) {
            var obj = jsonStr;
            var key, value, tagName, type, arr;
            for (x in obj) {
                key = x;
                value = obj[x];

                ctl.find("[name='" + key + "'],[name='" + key + "[]']").each(function () {
                    tagName = $(this)[0].tagName;
                    type = $(this).attr('type');
                    if (tagName == 'INPUT') {
                        if (type == 'radio') {
                            $(this).attr('checked', $(this).val() == value);
                        } else if (type == 'checkbox') {

                            if (isString(value.toString())) {

                                arr = value.toString().split(',');
                                for (var i = 0; i < arr.length; i++) {
                                    if ($(this).val() == arr[i]) {
                                        $(this).attr('checked', true);
                                        break;
                                    }
                                }
                            }
                        } else {
                            $(this).val(value);
                        }
                    } else if (tagName == 'SELECT' || tagName == 'TEXTAREA') {
                        $(this).val(value);
                    } else if (tagName == 'IMAGE') {
                        $(this).attr('src', value);
                    } else {
                        $(this).html(value);
                    }


                });
            }
        }
    });
});