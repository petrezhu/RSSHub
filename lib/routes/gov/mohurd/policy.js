const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://www.mohurd.gov.cn/zhengcefabu/index.html`;
    const response = await got({ method: 'get', url: link });

    const $ = cheerio.load(response.data);
    const list = $('div.linkList-section-wrapper ul > li.date')
        .map((_, item) => {
            const a = $(item).find('a');
            const date = $(item).find('span.date-info').text();
            return {
                title: a.attr('title'),
                link: a.attr('href'),
                pubDate: new Date(date + ' GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '中华人民共和国住房和城乡建设部 - 政策发布',
        link,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.editor-content').html();
                    return item;
                })
            )
        ),
    };
};
