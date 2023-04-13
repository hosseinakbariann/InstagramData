var express = require('express');
var router = express.Router();
let controller = require('../controller/conroller');


router.get('/addUserInfo', async function(req, res, next) {
    let result = await new controller().addUserInfo(req.query);
    res.send(result);
});

router.get('/addPostInfo', async function(req, res, next) {
    let result = await new controller().addPostInfo(req.query);
    res.send(result);
});


router.get('/addHashtags', async function(req, res, next) {
    let result = await new controller().addHashtags(req.query);
    res.send(result);
});

module.exports = router;
