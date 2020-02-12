const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser')

const router = require('./router'); 

const app = new Koa();
// 使用ctx.body解析中间件
app.use(bodyParser())

app.use(router.routes()).use(router.allowedMethods())

app.listen(5000);