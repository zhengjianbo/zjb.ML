/**
 * localdb  项目资源
 * 
 * 【Timeline】
 * 2017/11/07 Pithing       Design the all base class and achieve all class.
 */
const fs = require('fs');
const join = require('path').join;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Module = require('./Module');

class localdb extends Module {
    constructor(lowdb) {
        super(lowdb);
    }
    RemoveDatabase(id) {
        return super.ArrayRemove('database', { id: id });
    }
    SaveDatabase(json) {
        if (!json.params)
            json.params = [];
        return super.ArraySave('database', json, { id: json.id });
    }
    Save(json) {
        return this.__lowdb__.assign(json).write();
    }
}
localdb.prototype.Id = undefined;
//所有项目资源
localdb.Path = undefined;
localdb.Modules = undefined;
localdb.All = {
    Value: function () {
        let result = [];
        for (let key in localdb.All) {
            if (key != "Value")
                result.push(localdb.All[key].Value());
        }
        return result;
    }
};
localdb.Save = function (json) {
    if (!json.id) {
        json.id = localdb.CreateId();
    }
    if (!json.database)
        json.database = [];
    let project = localdb.All[json.id];
    if (project) {
        project.Save(json);
    } else
        localdb.New(json);
}
localdb.Remove = function (id) {
    let project = localdb.All[id];
    if (project) {
        delete localdb.All[id];
        deleteFolderRecursive(join(localdb.Path, id));
    }
}
localdb.New = function (json) {
    let id = json.id ? json.id : localdb.CreateId();
    let dir = join(localdb.Path, id);
    //新建文件夹
    fs.mkdirSync(dir);
    //新建project.json
    let project = new localdb(low(new FileSync(join(dir, 'project.json'))));
    project.Save(json);
    localdb.All[id] = project;
    localdb.Modules.forEach(function (module) {
        if (module.name &&module.name != localdb.name) {
            var name = `${module.name.toLowerCase()}.json`;
            project[module.name] = new module(low(new FileSync(join(dir, name))));
            project[module.name].Parent = project;
        }
    });
    if (localdb.OnChange) {
        localdb.OnChange(project);
    }
    return project;
}
//初始化所有项目信息
localdb.Initial = async function (path) {
    localdb.Path = path;
    //获取所有module
    var modules = localdb.Modules = await new Promise((resolve, reject) => {
        let path = `${__dirname}`;
        fs.readdir(path, (err, files) => {
            let modules = [];
            for (let index = 0; index < files.length; index++) {
                let file = files[index];
                let full = join(path, files[index]);
                let info = fs.statSync(full);
                if (info.isFile())
                    modules.push(require(full));
            }
            resolve(modules);
        });
    });
    /**
     * 遍历lowdb文件夹、生成project和内部属性
     */
    return await new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            var pms = [];
            for (var index = 0; index < files.length; index++) {
                var file = files[index];
                var full = join(path, files[index]);
                var info = fs.statSync(full);
                if (info.isDirectory()) {
                    pms.push(new Promise((resolve, reject) => {
                        let project = new localdb(low(new FileSync(join(full, 'project.json'))));
                        let val = project.Value();
                        if (val.name != undefined) {
                            project.Id = val.id;
                            modules.forEach(function (module) {
                                if (module.name != localdb.name) {
                                    var name = `${module.name.toLowerCase()}.json`;
                                    if (fs.existsSync(join(full, name))) {
                                        project[module.name] = new module(low(new FileSync(join(full, name))));
                                        project[module.name].Parent = project;
                                    }
                                }
                            });
                            localdb.All[val.id] = project;
                        } else {
                            //删除项目
                          //  deleteFolderRecursive(full);
                        }
                        resolve();
                    }));
                }
            }
            Promise.all(pms).then(resolve);
        });
    });
}
module.exports = exports = localdb;


function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
