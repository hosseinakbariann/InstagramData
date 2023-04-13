var express = require('express');
var router = express.Router();
let dataConroller = require('../controller/dataConroller');
let stream = require('stream');
let json2xls = require('json2xls');
let moment = require('moment-jalaali');

router.get('/getUserInfo', async function(req, res, next) {
    let result = await new dataConroller().getUserInfo(req.query);
    if(req.query.resultType==='excel'){
        sendExcel(result,res);
    }else {
        res.send({result: {data:result, statusCode: 200}})
    }
});

router.get('/getPostInfo', async function(req, res, next) {
    let result = await new dataConroller().getPostInfo(req.query);
    if(req.query.resultType==='excel'){
        sendExcel(result,res);
    }else {
        res.send({result: {data:result, statusCode: 200}})
    }
});

router.get('/getCommentsInfo', async function(req, res, next) {
    let result = await new dataConroller().getCommentsInfo(req.query);
    if(req.query.resultType==='excel'){
        sendExcel(result,res);
    }else {
        res.send({result: {data:result, statusCode: 200}})
    }
});

router.get('/getHashtags', async function(req, res, next) {
    let result = await new dataConroller().getHashtags(req.query);
    if(req.query.resultType==='excel'){
        sendExcel(result,res);
    }else {
        res.send({result: {data:result, statusCode: 200}})
    }
});

router.get('/getPostArchive', async function(req, res, next) {
    let result = await new dataConroller().getPostArchive(req.query);
    if(req.query.resultType==='excel'){
        sendExcel(result,res);
    }else {
        res.send({result: {data:result, statusCode: 200}})
    }
});

function getReadStreamForFileContent(fileContent) {
    let rStream = new stream.Readable();
    rStream._read = () => {
    };
    rStream.push(fileContent);
    rStream.push(null);
    return rStream;
}

function sendExcel(input, response) {
    let xls = json2xls(input);
    let buffer = Buffer.from(xls, 'binary');
    let readStreamdata = getReadStreamForFileContent(buffer);
    response.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment;filename=' + moment().format('jYYYYjMMjDD_HHmmss') + '.xlsx'
    });
    readStreamdata.pipe(response);
}

module.exports = router;
