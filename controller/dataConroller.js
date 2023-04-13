let dataBusinessLogic = require('../businessLogic/dataBL');

class Controller {
    constructor() {

    }

    async getUserInfo(param) {
        try {
            let result = await new dataBusinessLogic().getUserInfo(param);
           return result;
        } catch (e) {
            console.log(e)
        }
    }


    async getPostInfo(param) {
        try {
            let result = await new dataBusinessLogic().getPostInfo(param);
            result.forEach(item=>{
                delete item.isUpdated;
            });
            return result;
        } catch (e) {
            console.log(e)
        }
    }

    async getCommentsInfo(param) {
        try {
            let result = await new dataBusinessLogic().getCommentsInfo(param);
            return result;
        } catch (e) {
            console.log(e)
        }
    }

    async getHashtags(param) {
        try {
            let result = await new dataBusinessLogic().getHashtags(param);
            return result;
        } catch (e) {
            console.log(e)
        }
    }

    async getPostArchive(param) {
        try {
            let result = await new dataBusinessLogic().getPostArchive(param);
            return result;
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = Controller;
