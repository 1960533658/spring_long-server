const router = require('koa-router')()

const { gridlist } = require('../controller')

router.get('/index', async (ctx, next) => {
  await ctx.render('index', {
    title: 'spring_long'
  })
})

router.get('/gridlist', gridlist)
module.exports = router
