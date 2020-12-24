import Router from 'koa-router'
import * as controllers from '../controllers/test'

// const router = new Router({
//     prefix: '/api/v1/user'
//   })

const router = new Router()

router.get('/', controllers.test)

export default router