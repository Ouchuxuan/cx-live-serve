import Router from 'koa-router'
import testRouter from './test'

const appRouter: Router[] = [
    testRouter,
]

export default appRouter