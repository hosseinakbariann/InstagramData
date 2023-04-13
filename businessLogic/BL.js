let DBhandler = require('../dbHandler');
let cheerio = require('cheerio');
let axios = require('axios');
// let q = require('q');
// let async = require('async');
let browserUtil = require('../browser');
let moment = require('moment-jalaali');
class businessLogic {
    constructor() {
    }

    /////////////////////////////////////// List of API`S ///////////////////////////////////////

    async addUserInfo(param) {
        try {
            let page = browserUtil.getPage();
            //let browser = browserUtil.getBrowser();
            //let page  = await this.openNewPage(browser);
            console.log('service Started for user ================================>', param.user);
            await page.goto(`https://www.instagram.com`, {waitUntil: 'networkidle0', timeout: 100000});
            let loginStatus = await this.isLoggedIn(page);
            if (!loginStatus) {
                await this.login(page);
            }
            await page.goto(`https://www.instagram.com/${param.user}`, {waitUntil: 'networkidle0', timeout: 100000});
            await page.waitForSelector('#react-root > section > main > div > header > section > ul > li:nth-child(1) > span > span', {timeout: 160000});
            let html = await page.evaluate(() => {
                let data = Array.from(document.querySelectorAll('body'));
                return data.map(item => {
                    return item.innerHTML
                });
            });
            let $ = cheerio.load(html[0]);
            let info = {
                user: param.user,
                posts: $('#react-root > section > main > div > header > section > ul > li:nth-child(1) > span > span').text().replace('m', '000000').replace('k', '000').replace(/,/g, ''),
                followers: $('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a > span').text().replace('m', '000000').replace('k', '000').replace(/,/g, ''),
                followings: $('#react-root > section > main > div > header > section > ul > li:nth-child(3) > a > span').text().replace('m', '000000').replace('k', '000').replace(/,/g, ''),
                bio: $('#react-root > section > main > div > header > section > div.QGPIr').text(),
            };
            await new DBhandler().insert('userInfo', {user: info.user}, info);
            let posts = [];
            let count = 0;
            while (parseInt(info.posts) > count + 1) {
                posts = [];
                let likesVideos = await page.evaluate(() => {
                    //return window._sharedData.entry_data.ProfilePage[0].graphql.user.edge_felix_video_timeline.edges
                    return window._sharedData.entry_data.ProfilePage[0].graphql.user.edge_felix_video_timeline.edges
                });
                let likesPosts = await page.evaluate(() => {
                    //return window._sharedData.entry_data.ProfilePage[0].graphql.user.edge_felix_video_timeline.edges
                    return window._sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges
                });
                let data = await page.evaluate(() => {
                    let data = Array.from(document.querySelectorAll('body'));
                    return data.map(item => {
                        return item.innerHTML
                    });
                });
                $ = cheerio.load(data[0]);
                $('div.v1Nh3').each(function (i, element) {
                    let id = $(element).find('a').attr('href');
                    id = id.split('/');
                    posts.push({
                        id: id[2].replace('/').trim(),
                        likesNumber: '',
                        commentsNumber: '',
                        viewNumber:'',
                        link: 'https://www.instagram.com' + $(element).find('a').attr('href'),
                        user: param.user,
                        caption: '',
                        hashtags: '',
                        isUpdated:false
                    });
                });
                posts.forEach(post => {
                    let filteredLikes;
                    let filteredPostsLikes;
                    if (likesVideos) filteredLikes = likesVideos.find(like => like.node.shortcode == post.id);
                    if (likesPosts) filteredPostsLikes = likesPosts.find(like => like.node.shortcode == post.id);
                    if (filteredPostsLikes) {
                        post.likesNumber = filteredPostsLikes.node.edge_media_preview_like.count;
                        post.commentsNumber = filteredPostsLikes.node.edge_media_to_comment.count;
                    }
                    if (filteredLikes) {
                        post.likesNumber = filteredLikes.node.edge_media_preview_like.count;
                        post.commentsNumber = filteredLikes.node.edge_media_to_comment.count;
                    }
                });
                let findPost = await new DBhandler().get('posts', {user:param.user},{});
                let resultArray = [];
                posts.forEach(item=>{
                    let filteredPosts = findPost.find(elem=>elem.id ===item.id);
                    if(!filteredPosts){
                        resultArray.push(item);
                    }
                });
                if(resultArray[0]) await this.saveUrls(posts);
                await this.autoScroll(page);
                await new Promise(resolve => setTimeout(resolve, 5000));
                count = await new DBhandler().count('posts', {user: param.user});
            }
            console.log('successfully inserted', param.user);
            return {result: {
                    mesage: 'سرویس با موفقیت اجرا شد',
                    statusCode: 200
                }};
        } catch (e) {
            return {
                result: {
                    mesage: ` خطای ${e}`,
                    statusCode: 500
                }
            }
        }
    }

    async addPostInfo(params) {
        console.log('=====================> started to find posts');
        // let browser = browserUtil.getBrowser();
        // let page  = await this.openNewPage(browser);
        let page = browserUtil.getPage();
        try {
            await page.goto(`https://www.instagram.com`, {waitUntil: 'networkidle0', timeout: 600000});
            let loginStatus = await this.isLoggedIn(page);
            if (!loginStatus) {
                await this.login(page);
            }
            let data;
            if (params.post) data = await new DBhandler().get('posts', {postId: params.postId}, {});
            else if (params.user) data = await new DBhandler().get('posts', {user: params.user}, {});
            else data = await new DBhandler().get('posts', {}, {});
            if (!data[0]) return 'صفحه مورد نظر پیدا نشد';
            for (let i = 0; i < data.length; i++) {
                await this.openPages(data[i], page);
            }
            return {result: {mesage: 'سرویس با موفقیت اجرا شد', statusCode: 200}}
        } catch (e) {
            return {
                result: {
                    mesage: ` خطای ${e}`,
                    statusCode: 500
                }
            }
        }
    }

    async openPages(item, page) {
        console.log(item.id, '=====================> started');
        let today = moment().format('jYYYYjMjD');
        try {
            await page.goto(item.link, {waitU60000ntil: 'networkidle0', timeout: 600000});
            await new Promise(resolve => setTimeout(resolve, 5000));
            let html = await page.evaluate(() => {
                let data = Array.from(document.querySelectorAll('body'));
                return data.map(item => {
                    return item.innerHTML
                });
            });
            let $ = cheerio.load(html[0]);
            let caption = $('#react-root > section > main > div > div.ltEKP > article > div > div.qF0y9.Igw0E.IwRSH.eGOV_._4EzTm > div > div.eo2As > div.EtaWk > ul > div > li > div > div > div.C4VMK > span').text();
            let likeViews = $('span.vcOH2').text();
            let like = '';
            let view = '';
            if(likeViews.includes('views')){
                view = $('span.vcOH2 > span').text().replace(/,/g,'');
                like =  $('span.vcOH2 > span').text().replace(/,/g,'');
            }
            else{
                view = '';
                like =  $('#react-root > section > main > div > div.ltEKP > article > div > div.qF0y9.Igw0E.IwRSH.eGOV_._4EzTm > div > div.eo2As > section.EDfFK.ygqzn > div > div > div a span').text().replace(/,/g,'');
            }
            let data = {
                id: item.id,
                user: item.user,
                likesNumber: like,
                viewNumber:view,
                caption: caption,
                hashtags: caption.match(/#[a-zا-ی0-9_]+/gm)? caption.match(/#[a-zا-ی0-9_]+/gm).map(x => x.replace('#', '')): ''
            };
            let isExist = 0;
            if(data.likesNumber==='')data.likesNumber=0;
            let currentPost = {
                likesNumber: data.likesNumber,
                viewNumber: data.viewNumber,
                caption: data.caption,
                hashtags: data.hashtags,
                isUpdated:true
            };
            let currentPostArchive = currentPost;
            currentPost.date = today;
            await new DBhandler().update('posts', {id: data.id, user: data.user}, currentPost);
            await new DBhandler().insert('postsArchive', {id: data.id, user: data.user,date:today}, currentPostArchive);
            let comments = [];
            let commentsNumber = 0;
            do {
                commentsNumber = 0;
                let post = await page.evaluate(() => {
                    let data = Array.from(document.querySelectorAll('html'));
                    return data.map(item => {
                        return item.innerHTML
                    });
                });
                let $ = cheerio.load(post[0]);
                let button = $('#react-root > section > main > div > div.ltEKP > article > div > div.qF0y9.Igw0E.IwRSH.eGOV_._4EzTm > div > div.eo2As > div.EtaWk > ul > li > div > button');
                if (button[0]) isExist = 1;
                else isExist = 0;
                if (isExist===1) await page.click('#react-root > section > main > div > div.ltEKP > article > div > div.qF0y9.Igw0E.IwRSH.eGOV_._4EzTm > div > div.eo2As > div.EtaWk > ul > li > div > button', {timeout: 10000});
                await new Promise(resolve => setTimeout(resolve, 3000));
                $('ul.Mr508').each(function (i, element) {
                    let id = $(element).find('a').attr('href');
                    id = id.split('/');
                    comments.push({
                        id: item.id,
                        user: item.user,
                        commentText: $(element).find('div.C4VMK > span').text(),
                        commentUser: $(element).find('a.sqdOP').text()
                    });
                });
                $('ul.Mr508').each(function (i, element) {
                    let id = $(element).find('a').attr('href');
                    id = id.split('/');
                    commentsNumber++;
                });
                await this.savePosts(comments);
            } while (isExist === 1);
            await new DBhandler().update('posts', {id: data.id}, {commentsNumber: commentsNumber});
            await new DBhandler().update('postsArchive',  {id: data.id,date:today}, {commentsNumber: commentsNumber});
        } catch (e) {
            console.log(e);
        }
    }


    async addHashtags(params) {
        let hashtags=[];
        let data;
        try {
            if (params.hashtag){
                hashtags.push((params.hashtag).replace('#',''))
            }
            else if (params.id){
                data = await new DBhandler().get('posts', {id: params.id}, {});
                if(data[0]){
                    data[0].hashtags.forEach(item=>{
                        hashtags.push((item).replace('#',''));
                    });
                }
                if (!data[0]) return 'صفحه مورد نظر پیدا نشد';
            }
            else return {result: {mesage: `صفحه مورد نظر پیدا نشد`, statusCode: 404}};
            let page = browserUtil.getPage();
            await page.goto(`https://www.instagram.com`, {waitUntil: 'networkidle0', timeout: 100000});
            let loginStatus = await this.isLoggedIn(page);
            if (!loginStatus) {
                await this.login(page);
            }
            for(let i=0;i<hashtags.length;i++){
                let item = hashtags[i];
                console.log('finding hashtag =====================> #',item);
                await page.goto(`https://www.instagram.com/explore/tags/${item}/`, {waitUntil: 'networkidle0', timeout: 100000});
                let tags = await page.evaluate(() => {
                    let data = Array.from(document.querySelectorAll('#react-root > section > main > header > div.WSpok > div > div.qF0y9.Igw0E.IwRSH.eGOV_._4EzTm.a39_R > span > span'));
                    return data.map(item => {
                        return item.innerText
                    });
                });
                if(tags[0]){
                    let tagsData = {
                        hashtag:item,
                        postNumbers:tags[0].replace(/,/g,'').trim()
                    };
                    await new DBhandler().insert('hashtags',{hashtag:tagsData.hashtag},tagsData);
                }
                return {result: {mesage: 'سرویس با موفقیت اجرا شد', statusCode: 200}}
            }
        } catch (e) {
            return {result: {mesage: ` خطای ${e}`, statusCode: 500}}}
    }


    /////////////////////////////////////// List of DB services ///////////////////////////////////////

    async saveUrls(data) {
        for (let i = 0; i < data.length; i++) {
            try {
                let item = data[i];
                await new DBhandler().insert('posts', {link: item.link, user: item.user}, item)
            } catch (e) {
                console.log(e);
            }
        }
    }

    async savePostArchives(data) {
        for (let i = 0; i < data.length; i++) {
            try {
                let item = data[i];
                await new DBhandler().insert('postsArchive', {link: item.link, user: item.user}, item)
            } catch (e) {
                console.log(e);
            }
        }
    }

    async savePosts(data) {
        for (let i = 0; i < data.length; i++) {
            try {
                let item = data[i];
                await new DBhandler().insert('comments', {commentUser: item.commentUser,commentText:item.commentText}, item)
            } catch (e) {
                console.log(e);
            }
        }
    }

    /////////////////////////////////////// List of services  ///////////////////////////////////////

    async openNewPage(browser){
        let page = await browser.newPage();
        await page.setViewport({width: 1200, height: 600});
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.resourceType() === 'image' || req.resourceType() == 'video') {
                req.abort();
            }
            else {
                req.continue();
            }
        });
        return page;
    }

    async autoScroll(page) {
        return await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            return document.body.scrollHeight;
        });
    }


    async login(page) {
        try {
            let coockiePolicies = await page.evaluate(() => {
                let data = Array.from(document.querySelectorAll('button.bIiDR'));
                return data.map(item => {
                    return item.innerText;
                });
            });
            if (coockiePolicies[0]) {
                await page.goto(`https://www.instagram.com`, {waitUntil: 'networkidle0', timeout: 600000});
                await page.click('button.bIiDR', {timeout: 10000});
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
            await page.type('input[name=username]', '');
            await page.type('input[name=password]', '');
            await page.click('button.L3NKy', {timeout: 10000});
            await page.waitForNavigation({timeout: 160000});
        } catch (e) {
            console.log(e);
        }
    }


    async isLoggedIn(page) {
        let loggedIn = await page.evaluate(() => {
            let data = Array.from(document.querySelectorAll('#loginForm > div > div.qF0y9.Igw0E.IwRSH.eGOV_._4EzTm.bkEs3.CovQj.jKUp7.DhRcB > button > div'));
            return data.map(item => {
                return item.innerText;
            });
        });
        if (!loggedIn[0]) return true;
        else return false;
    }
}

module.exports = businessLogic;
