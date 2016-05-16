const serve = require('koa-static');
const koa = require('koa');
const app = koa();

app.use(serve('.'));

app.listen(3000);