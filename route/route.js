const config = require('../config')
const http = require('http');
const Koa = require('koa')
const Router = require('koa-router')
const convert = require('koa-convert');
const session = require('koa-session')
const mgdb = require('../module/mgdb');
const token = require('./token');
const vm = require('vm')
class Route {
    constructor() {
        this.Init()
    }
    async Init() {
        let err = await mgdb.mdb.connect();
        if (err) {
            console.log(err.message);
            return;
        } else {
            console.log("连接成功");

        }
        const app = new Koa();
        this.router = new Router();
        this.tokens = null;
        const server = http.Server(app.callback());
        const CONFIG = {
            key: 'koa:sess', /* 默认的cookie签名 */
            maxAge: 86400000,/* cookie的最大过期时间 */
            autoCommit: true, /** (boolean) automatically commit headers (default true) */
            overwrite: true, /** 无效属性 */
            httpOnly: true, /** (boolean) httpOnly or not (default true) */
            signed: true, /** 默认签名与否 */
            rolling: false, /** 每次请求强行设置cookie */
            renew: false, /** cookie快过期时自动重新设置*/
        };

        app.use(session(CONFIG, app));
        app.use(require('koa-compress')());
        app.use(convert(require('koa-cors')()));
        app.use(require('koa-bodyparser')({
            formLimit: "512mb",
            jsonLimit: "512mb"
        }));
        app.use(require('koa-static')('web'));
        app.use(this.router.routes()).use(this.router.allowedMethods());
        server.listen(config.service_port);
        this.Start();
    }
    /**
     * 
     * @param {*} runjs 
     * @param {*} _para 
     * @param {*} callback 
     */
    async LoadJs(runjs, _para, callback) {
        let __para = this;
        __para.__db = mgdb.mdb.db;
        __para.require = require;
        __para.__session = _para.session;
        __para.__params = _para.para;
        __para.process = process;
        let script = new vm.Script(`
        new Promise(async (resolve, reject) => {
            try {
               ${runjs}
               ${runjs.indexOf('resolve(') == -1 ? 'resolve()' : ''}
            } catch (error) { resolve(error.message?error.message:error) }
        })
        `);
        let result = {}
        try {
            result = await script.runInContext(vm.createContext(__para));
        } catch (e) {
            result = { code: 1001, msg: e.message };
        }
        return result;
    }
    Start() {
        console.log(`[Api] 接口服务已经运行 ${config.service_ip}:${config.service_port}`);
        let that = this;
        this.router.all('/ml/:jkdm', async function (ctx, next) {
            let params = ctx.request.method.toLowerCase() == "post" ? ctx.request.body : ctx.request.query;
            let headers = ctx.request.headers;
            let accesstoken = headers.accesstoken || ctx.cookies.get("x-access-token");

            if (accesstoken) {
                if (token.checkToken(accesstoken)) {
                    let tokenObj = token.decodeToken(accesstoken);
                    ctx.session.sign = true;
                    ctx.session.login = tokenObj.payload.data;
                    ctx.session.isapp = true;
                }
            }
            // if (!ctx.session.sign && ctx.params.jkdm != "Login"
            //     && ctx.params.jkdm != "reg" && ctx.params.jkdm != "getCode"
            //     && ctx.params.jkdm != "getwxrygl"
            //     && ctx.params.jkdm != "getxtgl_ui"
            //     && ctx.params.jkdm != "Logout"
            //     && ctx.params.jkdm != "sendmsg"
            //     && ctx.params.jkdm != "tsrygl"
            //     && ctx.params.jkdm != "getjkdb_ui"
            //     && ctx.params.jkdm != "settzwy") {
            //     ctx.body = { msg: "没有权限", code: 1001 };
            //     return;
            // }
            //  var tablename = ctx.params.tablename;
            //  params.session = ctx.session;
            // params.tablename = ctx.params.tablename;
            let para = {
                para: params,
                session: ctx.session, headers: headers,
            }

            let rs = await mgdb.mdb.Find('jkdb', {
                where: { JKMC: ctx.params.jkdm },
                para: {
                    page: 0,
                    limit: 10, sort: []
                }
            });
            if (rs && rs.rows.length > 0) {
                //req.session.inTransaction = function () { };
                let result = await that.LoadJs(rs.rows[0].JKSQL, para);
                ctx.body = result;
            } else {
                ctx.body = {};
            }
        });
    }
}

module.exports = exports = new Route();
