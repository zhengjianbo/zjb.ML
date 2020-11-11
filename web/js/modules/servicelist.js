/** layuiAdmin.std-v1.0.0 LPPL License By http://www.layui.com/admin/ */;
layui.define(["table", "form"], function (t) {
    var e = layui.$,
        tb = layui.table,
        from = layui.form;
    var $ = layui.jquery = layui.$;
    active = {
        loadsub: function () {

        },
        load: function () {
            //监听搜索
            layui.form.on('submit(LAY-app-contlist-search)', function (data) {
                var field = data.field;

                for (var i in field) {
                    field[i] = {
                        $regex: field[i],
                        $options: 'm'
                    };
                }
                //执行重载
                tb.reload('LAY-app-content-list', {
                    where: {
                        para: JSON.stringify({
                            where: field
                        })
                    }
                });
            });
            var $ = layui.$;
            var active = layui.servicelist;
            $('.layui-btn.layuiadmin-btn-list').on('click', function () {
                var type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });
        },
        del: function (ids, callback) {
            $.ajax({
                type: 'POST',
                url: layui.tool.Weburl + '/ml/del',
                data: { where: ids, tablename: 'jkdb' },
                dataType: 'json',
                success: function (msg) {


                    if (callback) {
                        callback(msg)
                    }



                }
            });
        },
        open: function (title, t, data) {
            var _layer = layer.open({
                type: 2,
                title: title,
                content: 'servicelistform.html',
                maxmin: true,
                area: ['700px', '550px'],
                btn: ['确定', '取消'],
                yes: function (e, i) {
                    var top = window["layui-layer-iframe" + e],
                        a = i.find("iframe").contents().find("#layuiadmin-app-form-edit");
                    top.layui.form.on("submit(layuiadmin-app-form-edit)", function (_data) {
                        var subdata = _data.field;
                        var theString = i.find("iframe")[0].contentWindow.meditor.getValue();
                        // theString = theString.replace("/>/g", "&gt;");
                        // theString = theString.replace("/</g", "&lt;");

                        // theString = theString.replace("/ /g", "&nbsp;");
                        // theString = theString.replace("/\"/g", "&quot;");
                        // theString = theString.replace("/\'/g", "&#39;");
                        // theString = theString.replace(/\+/g, "%2B");
                        // theString = theString.replace(/&/g, "%26");
                        // theString = theString.replace("/\\/g", "\\\\"); //对斜线的转义  
                        // theString = theString.replace("/\n/g", "\\n");
                        // theString = theString.replace("/\r/g", "\\r");
                        subdata.JKSQL = theString;

                        var parobj = { rows: subdata, tablename: 'jkdb' };
                        if (subdata.ID) {
                            parobj.where = { ID: subdata.ID }
                        }
                        $.ajax({
                            type: 'POST',
                            url: layui.tool.Weburl + '/ml/save_service',
                            data: parobj,
                            dataType: 'json',
                            success: function (msg) {

                                if (msg && msg.Success) {
                                    if (data) {
                                        t.update(a)
                                        from.render();
                                        layer.msg("更新成功")
                                    } else {

                                    }
                                    tb.reload('LAY-app-content-list');
                                    if (!subdata.ID) {
                                        layer.close(e);
                                    }


                                }

                            }
                        });

                    }), a.trigger("click")
                },
                success: function (t, e) {
                    if (data) {
                        var n = t.find("iframe").contents().click();
                        layui.tool.loadData(data, n);
                        var str = data.JKSQL;
                        t.find("iframe")[0].contentWindow.createeidt(str)
                    }
                }
            });
            layer.full(_layer);
        },
        batchdel: function (ids) {
            var checkStatus = tb.checkStatus('LAY-app-content-list'),
                checkData = checkStatus.data; //得到选中的数据

            if (checkData.length === 0) {
                return layer.msg('请选择数据');
            }

            layer.confirm('确定删除吗？', function (index) {
                var ids = new Array()
                for (let i = 0; i < checkData.length; i++) {
                    const el = checkData[i];
                    ids.push({ ID: el.ID });
                }
                layui.servicelist.del(ids, function (msg) {
                    if (msg && msg.Success) {
                        tb.reload('LAY-app-content-list');
                        layer.msg('已删除');
                    }
                });

            });
        },
        add: function () {
            layui.servicelist.open('添加接口')
        }
    };
    tb.render({
        elem: "#LAY-app-content-list",
        url: layui.tool.Weburl + '/ml/getservice_ui',
        cols: [
            [
                { type: "checkbox", fixed: "left" },
                { field: "JKMC", title: "接口名称", minWidth: 100 },
                { title: "操作", width: 200, align: "center", fixed: "right", toolbar: "#table-content-list" }
            ]
        ],
        page: !0,
        limit: 10,
        limits: [10, 15, 20, 25, 30],
        text: "对不起，加载出现异常！"
    }), tb.on("tool(LAY-app-content-list)", function (t) {
        var data = t.data;
        "del" === t.event ? layer.confirm("确定删除此文章？", function (e) {
            layui.servicelist.del([{ ID: data.ID }], function (msg) {
                if (msg && msg.Success) {
                    t.del(), layer.close(e);
                    layer.msg('已删除');
                }
            });

        }) : "edit" === t.event && layui.servicelist.open('编辑接口', t, data)
    }), t("servicelist", active)
})