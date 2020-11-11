/**
 * 【Timeline】
 * 2017/11/08 Pithing       Design the all base class and achieve all class.
 */

class Module {
    constructor(lowdb) {
        this.__lowdb__ = lowdb;
        this.LowDB = lowdb;
    }
    Set(key, val) {
        return this.__lowdb__.set(key, val).write();
    }
    RemoveKey(key) {
        return this.__lowdb__.unset(key).write();
    }
    Value(key) {
        return key ? this.__lowdb__.get(key).value() : this.__lowdb__.value();
    }
    ArraySave(key, json, filter) {
        let result;
        if (!this.__lowdb__.get(key).find(filter).value())
            result = this.__lowdb__.get(key).push(json).write();
        else
            result = this.__lowdb__.get(key).find(filter).assign(json).write();
        return result;
    }
    ArrayRemove(key, filter) {
        return this.__lowdb__.get(key).remove(filter).write();
    }
    Exists(key) {
        return this.__lowdb__.has(key).value();
    }
    CreateId() {
        return Module.CreateId();
    }
}
Module.CreateId = function () {
    var hash = 'xxxyxxxyxxxyxxxy'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    if (hash[0].charCodeAt() >= 48 && hash[0].charCodeAt() <= 57) return Module.CreateId();
    return hash;
}
Module.prototype.LowDB = undefined;
module.exports = exports = Module;

