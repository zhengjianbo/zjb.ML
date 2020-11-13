const config = require('../config')
const http = require('http');
const Koa = require('koa')
const Router = require('koa-router')
const convert = require('koa-convert');
const koaBody = require('koa-body');
const session = require('koa-session')
const mgdb = require('../module/mgdb');
const token = require('./token');
const fs = require('fs')
const path = require('path')
const vm = require('vm')
var UUID = require('uuid');
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
        app.use(koaBody({
            multipart: true,
            formidable: {
                maxFileSize: 2000 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
            }
        }))
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
            result = e;
        }
        return result;
    }
    Start() {
        console.log(`[Api] 接口服务已经运行 ${config.service_ip}:${config.service_port}`);
        let that = this;
        this.router.post('/uploader', async function (ctx, next) {
            // 上传多个文件
            const files = ctx.request.files.files || ctx.request.files.file; // 获取上传文件
            if (!files) {
                ctx.body = { code: 1001, msg: "没有文件上传", data: [] };
                return;
            }
            let result = [];
            if (files instanceof Array) {
                for (let file of files) {
                    // 创建可读流
                    const reader = fs.createReadStream(file.path);
                    var extname = path.extname(file.name)
                    let newfileName = UUID.v1() + extname;
                    // 获取上传文件扩展名
                    let filePath = path.join(process.cwd(), 'web/upload') + `/${newfileName}`;
                    // 创建可写流
                    const upStream = fs.createWriteStream(filePath);
                    // 可读流通过管道写入可写流
                    reader.pipe(upStream);
                    let newfile = { ID: UUID.v1(), SCWJM: file.name, XWJM: newfileName }
                    let re = await mgdb.mdb.Add([newfile], 'fjxx');
                    result.push("upload/" + newfileName);
                }
            }
            else {
                // 创建可读流
                const reader = fs.createReadStream(files.path);
                var extname = path.extname(files.name)
                let newfileName = UUID.v1() + extname;
                let filePath = path.join(process.cwd(), 'web/upload') + `/${newfileName}`;
                // 创建可写流
                const upStream = fs.createWriteStream(filePath);
                // 可读流通过管道写入可写流
                reader.pipe(upStream);
                let newfile = { ID: UUID.v1(), SCWJM: files.name, XWJM: newfileName }
                let re = await mgdb.mdb.Add([newfile], 'fjxx');
                result.push("upload/" + newfileName);
            }
            //图片写入地址；

            //var mgdb = require('./mgdb');
            //    let result = await mgdb.mdb.Add([newfile], 'fjxx');
            if (result) {
                ctx.body = { code: 200, msg: "成功", data: result };
            }
            else {
                ctx.body = { code: 65535, msg: "失败", data: [] };
            }


        });

        this.router.all('/:jkdm', async function (ctx, next) {
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
