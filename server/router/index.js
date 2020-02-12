const Router = require('koa-router');
const db = require('../db/index');

const test = new Router();

// 获取接口
test.get('/restful', async ( ctx ) => {
    ctx.body = db.get('restful').value();
});

// 添加接口
test.post('/restful', async (ctx) => {
    console.log(ctx.request.body);
    let req = ctx.request.body;
    let dbData = db.get('restful').value();
    let index = dbData.findIndex((data) => (data.id === req.id));
    if(index !== -1) {
        db.get('restful')
            .find({ id: req.id })
            .assign(req)
            .write()
    } else {
        req.id = dbData.length;
        db.get('restful').push(req).write();
    }
    ctx.body = {
        data: db.get('restful').value(),
        cc: 0
    };
})

// 删除接口
test.delete('/restful/:id', async ( ctx ) => {
    db.get('restful')
        .remove({ "id": parseInt(ctx.params.id) })
        .write()
    ctx.body = {
        data: db.get('restful').value(),
        cc: 0
    };
});

const router = new Router();
router.use(test.routes(), test.allowedMethods());

module.exports = router;