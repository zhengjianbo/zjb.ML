# zjb.ML
基于nodejs国产后台开发IDE，适用于中国小微型所有项目，任然存在不足希望，所有使用的人不断的完善，仅用于自研与学习，不得商用
#运行
npm i
然后F5
#数据库
采用mongo，必须有没有则无法启动
#核心表
mongo安装完成后请手动建立   jkdb  数据集
##添加文档getjkdb_ui
{
    "_id": ObjectId("5b9733108661e50e24ea6cde"),
    "JKMC": "getjkdb_ui",
    "ID": "262DBB6AE720024EC005F6374F9D45F8",
    "PXZD": "",
    "JKSQL": "var aa = await __db.collection('jkdb'); \r\nlet where=__params.where;\r\nlet limit=__params.limit;\r\nlet page=__params.page;\r\nif(!where)\r\n{\r\n    where={};\r\n}\r\n//where.JKMC={$nin:['getjkdb_ui','del','save']}\r\nlimit=limit?parseInt(limit):10\r\npage=page?parseInt(page)-1:0\r\n var para = { limit: limit, skip: page };\r\nvar rs= await aa.find(where, para).toArray();\r\nvar count=await aa.find(where).count();\r\nvar jsonArray = { data: rs,code:0, count: count };\r\nresolve(jsonArray);",
    "JKSM": "接口列表"
}
##添加文档save
{
    "_id": ObjectId("5fa3accfa9b4f2308c0af873"),
    "ID": "6795b200-1f3a-11eb-9373-69b2836b5ae0",
    "JKSQL": "var UUID = require('uuid');\r\nlet tb = await __db.collection('jkdb');\r\nlet rows = __params.rows\r\nlet where = __params.where\r\nlet result;\r\nif (where && where.ID) {\r\n    var updateStr = { $set: rows };\r\n    result = await tb.updateOne(where, updateStr, { multi: true });\r\n}\r\nelse {\r\n    if (!rows.ID) {\r\n        rows.ID = UUID.v1();\r\n    }\r\n    result = await tb.insertOne(rows);\r\n}\r\nvar jsonArray = { code: 0, Success: true, message: \"操作成功\", result: result };\r\nresolve(jsonArray); ",
    "JKMC": "save",
    "JKSM": "保存接口"
}
##添加文档del
{
    "_id": ObjectId("5fa3acb3a9b4f2308c0af872"),
    "ID": "576408f0-1f3a-11eb-9373-69b2836b5ae0",
    "JKSQL": "let where = __params.where\r\nlet tbname=__params.tablename;\r\nlet tb = await __db.collection(tbname);\r\nvar result = {};\r\ntry {\r\n    for (var i = 0; i < where.length; i++) {\r\n        await tb.deleteMany(where[i]);\r\n    }\r\n    result = { code: 0,message: '成功', Success: true };\r\n} catch (ex) {\r\n    result = { code: 0,message: ex?ex.message:\"\", Success: false };\r\n}\r\nresolve(result);",
    "JKMC": "del",
    "JKSM": "删除接口"
}

