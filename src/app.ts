import "reflect-metadata";
import Koa from 'koa';
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import appRouter from './routes'
import loggerMiddleware from './middlewares/log';
import { createConnection } from "typeorm";
import config from './config'
import NodeMediaServer from 'node-media-server';


const mediaServerConfig = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 8000,
        allow_origin: '*'
    }
};
const nms = new NodeMediaServer(mediaServerConfig)
nms.run();
// rtmp://192.168.0.10/live/stream
nms.on('preConnect', (id, args) => {
    console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
    // let session = nms.getSession(id);
    // session.reject();
});

nms.on('postConnect', (id, args) => {
    console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
    console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // let session = nms.getSession(id);
    // session.reject();
});

nms.on('postPublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // let session = nms.getSession(id);
    // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

const app = new Koa();

app.use(loggerMiddleware())
// 跨域处理
app.use(cors())
// 配置静态web服务器的中间件
app.use(bodyParser())
// databases
const connectDatabase = async () => {
    try {
        await createConnection();
    } catch (error) {
        console.error(error)
    }
}
connectDatabase();
// logger&&错误捕捉
app.use(async (ctx, next) => {
    try {
        await next();
        // 开始进入到下一个中间件
        if (ctx.status === 404) {
            ctx.throw(404);
        }
        // 记录响应日志
        ctx.logger.logResponse(ctx, new Date());
    } catch (error) {
        // 记录异常日志
        ctx.logger.logError(ctx, error, new Date());
        console.error(error)
    }
});

// router
appRouter.forEach(router => {
    app.use(router.routes()).use(router.allowedMethods())
})

app.listen(config.port)
console.log(`server is listening at port ${config.port}`)
