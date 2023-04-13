let puppeteer = require('puppeteer');
let _browser;
let _page;
module.exports = {
    openBrowser: async function (callback) {
        _browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            args: [`--window-size=1300,700`]
        });
        _page = await _browser.newPage();
        await _page.setViewport({width: 1200, height: 600});
        await _page.setRequestInterception(true);
        _page.on('request', (req) => {
            if (req.resourceType() === 'image' || req.resourceType() == 'video') {
                req.abort();
            }
            else {
                req.continue();
            }
        });
    },
    getPage: function () {
        return _page;
    },
    getBrowser: function () {
        return _browser;
    }
};
