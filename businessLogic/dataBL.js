let DBhandler = require('../dbHandler');

class businessLogic {
    constructor() {
    }

    async getUserInfo(param) {
        let result;
        try {
            if(param.user) result = await new DBhandler().get('userInfo',{user:param.user});
            else result = await new DBhandler().get('userInfo',{});
            return result;
        } catch (e) {
            return {result: {mesage: ` خطای ${e}`, statusCode: 500}}
        }
    }

    async getPostInfo(param) {
        let result;
        try {
            if(param.user) result = await new DBhandler().get('posts',{user:param.user});
            else if(param.id) result = await new DBhandler().get('posts',{id:param.id});
            return result;
        } catch (e) {
            return {result: {mesage: ` خطای ${e}`, statusCode: 500}}
        }
    }

    async getCommentsInfo(param) {
        let result;
        try {
            if(param.user) result = await new DBhandler().get('comments',{id:param.user});
            else if(param.id) result = await new DBhandler().get('comments',{id:param.id});
            return result;
        } catch (e) {
            return {result: {mesage: ` خطای ${e}`, statusCode: 500}}
        }
    }

    async getHashtags(param) {
        let result;
        try {
            if(param.user) result = await new DBhandler().get('hashtags',{id:param.id});
            else result = await new DBhandler().get('hashtags',{},{hashtags:-1});
            return result;
        } catch (e) {
            return {result: {mesage: ` خطای ${e}`, statusCode: 500}}
        }
    }
    async getPostArchive(param) {
        let result;
        try {
            if(param.id && param.startDate && param.endDate){
                result = await new DBhandler().get('postsArchive',{id:param.id,"date": {
                        "$gte": param.startDate,
                        "$lte": param.endDate
                    }});
            }
            else if(param.id && !param.startDate && !param.endDate){
                result = await new DBhandler().get('postsArchive',{id:param.id});
            }
            return result;
        } catch (e) {
            return {result: {mesage: ` خطای ${e}`, statusCode: 500}}
        }
    }

}

module.exports = businessLogic;
