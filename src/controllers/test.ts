import { Context, Next } from 'koa';
export const test = (ctx:Context) => {
    ctx.body='Hello World1'
}