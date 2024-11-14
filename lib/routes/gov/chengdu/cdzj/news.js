const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://cdzj.chengdu.gov.cn';
    const link = `https://cdzj.chengdu.gov.cn/cdzj/c131967/zwgk.shtml`;
    const response = await got({ method: 'get', url: link });

    const $ = cheerio.load(response.data);

    const list = $('div.artcleListWrap ul.artcleList li').map((_, item) => {
        const a = $(item).find('a');
        const date = $(item).find('span.artcleDate').text();

        return {
            title: a.attr('title'),
            link: new URL(a.attr('href'), rootUrl).href,
            pubDate: new Date(date + ' GMT+8').toUTCString(),
        };
    }).get();

    ctx.state.data = {
        title: '成都市住房和城乡建设局 - 新闻公告',
        link,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('#artcle .content').html() || '内容获取失败';
                    return item;
                })
            )
        ),
    };
};
