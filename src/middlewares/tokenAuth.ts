import { Context, Next } from 'koa';
import RedisHelper from '../utils/redisHelper';
import JsonHelper from '../utils/responseHelper';
import jwt from 'jsonwebtoken';
import config from '../config'

type mathType = (string | RegExp)[]


/**
 * @description 路由token权限控制,token过期登出,token不过期则await next
 */
export default (...whitePath: mathType) => {
  return async (ctx: Context, next: Next) => {
    // 如果匹配到的路由能匹配到数组里的某项，则跳出权限监测
    if (whitePath.length >= 0) {
      let isMatch = false;
      for (const path of whitePath) {
        const isReg = path instanceof RegExp;
        const url = ctx.URL.href
        if (isReg) {
          isMatch = (path as RegExp).test(url);
        } else {
          isMatch = path === url
        }
        if (isMatch) break;
      }
      if (isMatch) {
        await next();
        return;
      }
    }
    const clientToken = ctx.request.header['authorization'];
    if (!clientToken) {
      ctx.body = JsonHelper.response('NOAUTH')
      return;
    }
    const userData = jwt.verify(clientToken, config.secretKey);
    const idCard = (userData as any).id_card;
    const redis = new RedisHelper(0);
    const key = `session:${idCard}`;
    const redisUserData = redis.get(key);
    if (!redisUserData) {
      ctx.body = JsonHelper.response('TOKENEXPIRED')
      return;
    }
    await next();
  }
}
