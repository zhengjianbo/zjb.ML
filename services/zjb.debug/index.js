const child = require('child_process');
let servePath = `${process.cwd()}\\services\\zjb.debug`;
let last = child.exec(`node --inspect-brk ${servePath}\\index.js`, function (error, stdout, stderr) {
  if (!error) {
    if (stderr) {
      resolve('错误信息：' + stderr);
    } else {
      resolve('输出：' + stdout);
    }
  }
  else {
    resolve('错误信息：' + error);
  }
});



