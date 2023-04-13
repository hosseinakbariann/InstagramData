let businessLogic = require('../businessLogic/BL');

class Controller {
    constructor() {

    }

    async addUserInfo(param) {
        try {
             let result = await new businessLogic().addUserInfo(param);
             return result;
        } catch (e) {
            console.log(e)
        }
    }


    async addPostInfo(param) {
        try {
            let result = await new businessLogic().addPostInfo(param);
            return result;
        } catch (e) {
            console.log(e)
        }
    }

    async addHashtags(param) {
        try {
            let result = await new businessLogic().addHashtags(param);
            return result;
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = Controller;
