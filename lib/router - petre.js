// eslint-disable-next-line n/no-extraneous-require
const Router = require('@koa/router');
const router = new Router();

const RouterHandlerMap = new Map();

// 懒加载 Route Handler，Route 首次被请求时才会 require 相关文件
const lazyloadRouteHandler = (routeHandlerPath) => (ctx) => {
    if (RouterHandlerMap.has(routeHandlerPath)) {
        return RouterHandlerMap.get(routeHandlerPath)(ctx);
    }

    const handler = require(routeHandlerPath);
    RouterHandlerMap.set(routeHandlerPath, handler);
    return handler(ctx);
};

// 中华人民共和国住房和城乡建设部
router.get('/gov/mohurd/constructionnews', lazyloadRouteHandler('./routes/gov/mohurd/constructionnews'));
router.get('/gov/mohurd/policy', lazyloadRouteHandler('./routes/gov/mohurd/policy'));

// 成都住建局 住房和城乡建设
router.get('/gov/chengdu/cdzj/news', lazyloadRouteHandler('./routes/gov/chengdu/cdzj/news'));

// 极客公园
router.get('/geekpark/breakingnews', lazyloadRouteHandler('./routes/geekpark/breakingnews'));

// MIT科技评论
router.get('/mittrchina/:type', lazyloadRouteHandler('./routes/mittrchina'));

// AI研习社
router.get('/aiyanxishe/:id/:sort?', lazyloadRouteHandler('./routes/aiyanxishe/home'));

module.exports = router;
