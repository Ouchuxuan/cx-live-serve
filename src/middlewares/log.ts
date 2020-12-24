import logConfig from '../config/logConfig';
import * as log4js from 'log4js';
import * as Koa from 'koa';
import moment from 'moment'
// 加载配置文件
log4js.configure(logConfig);

export interface logUtil {
  logError?: (ctx: Koa.Context, error: Error, resTime: Date) => void
  reqLog?: (ctx: Koa.Context, resTime: Date) => void
  logResponse?: (ctx: Koa.Context, resTime: Date) => void
  logInfo?: (info: string) => void
}

let logUtil: logUtil = {};
// 调用预先定义的日志名称
const resLogger = log4js.getLogger('resLogger');
const reqLogger = log4js.getLogger('http')
const errorLogger = log4js.getLogger('errorLogger')
const consoleLogger = log4js.getLogger()

// 封装错误日志
logUtil.logError = (ctx, error, resTime) => {
  if (ctx && error) {
    errorLogger.error(formatError(ctx, error, resTime))
  }
}

// 封装请求日志
logUtil.reqLog = (ctx, resTime) => {
  if (ctx) {
    reqLogger.info(formatReqLog(ctx.request, resTime));
  }
};
// 封装响应日志
logUtil.logResponse = (ctx, resTime) => {
  if (ctx) {
    resLogger.info(formatRes(ctx, resTime));
  }
};

logUtil.logInfo = (info) => {
  if (info) {
    consoleLogger.info(formatInfo(info));
  }
};

const formatInfo = (info: any) => {
  let logText = '';
  // 响应日志开始
  logText += '\n' + '***************info log start ***************' + '\n';
  // 响应内容
  logText += 'info detail: ' + '\n' + JSON.stringify(info) + '\n';
  // 响应日志结束
  logText += '*************** info log end ***************' + '\n';
  return logText;
}


// 格式化响应日志
const formatRes = (ctx: Koa.Context, resTime: Date): string => {
  let logText = '';
  // 响应日志开始
  logText += '\n' + '*************** response log start ***************' + '\n';
  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime);
  // 响应状态码
  logText += 'response status: ' + ctx.status + '\n';
  // 响应内容
  logText += 'response body: ' + '\n' + JSON.stringify(ctx.body) + '\n';
  // 响应日志结束
  logText += '*************** response log end ***************' + '\n';
  return logText;
}

// 格式化请求日志
const formatReqLog = (req: Koa.Request, resTime: Date): string => {
  const formatRestime = moment(resTime).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')
  let logText = '';
  const method = req.method;
  // 访问方法
  logText += '\n' + 'request method: ' + method + '\n';
  // 请求原始地址
  logText += 'request originalUrl:  ' + req.originalUrl + '\n';
  // 客户端ip
  logText += 'request client ip:  ' + req.ip + '\n';
  // 请求参数
  if (method === 'GET') {
    logText += 'request query:  ' + JSON.stringify(req.query) + '\n';
  } else {
    logText += 'request body: ' + '\n' + JSON.stringify(req.body) + '\n';
  }
  // 服务器响应时间
  logText += 'response time: ' + formatRestime + '\n';
  return logText;
}

// 格式化错误日志
const formatError = (ctx: Koa.Context, err: Error, resTime: Date): string => {
  let logText = '';
  // 错误信息开始
  logText += '\n' + '*************** error log start ***************' + '\n';
  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime);
  // 错误名称
  logText += 'err name: ' + err.name + '\n';
  // 错误信息
  logText += 'err message: ' + err.message + '\n';
  // 错误详情
  logText += 'err stack: ' + err.stack + '\n';
  // 错误信息结束
  logText += '*************** error log end ***************' + '\n';
  return logText;
}


export default () => {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    ctx.logger = logUtil;
    ctx.logger.reqLog(ctx, new Date());
    await next();
  }
}


