const localdb = require('./module/localdb');
localdb.Initial(`${process.cwd()}/lowdb`).then(_ => {
    //if (_.length == 0) {
        localdb.Save({ dfdsafdasfdas: "jksadfdb" ,id: "ffa9bcc8b46accab"})
        let obj = localdb.prototype.SaveDatabase({ dfdsafdasfdas: "jksadfdb" ,id: "ffa9bcc8b46accab"})
   // }
    require('./route/route');
});