let mongodbutil = require( './mongoUtil' );

// Improve debugging
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason)
});

class DBhandler {

    async insert(table,query,update){
        try {
            await mongodbutil.getDb().collection( table ).updateOne(query,{ $set:  update}, {upsert: true});
        }catch (e) {
            console.log(e);
        }
    }

    async update(table,query,update){
        try {
            await mongodbutil.getDb().collection( table ).updateOne(query,{ $set:  update});
        }catch (e) {
            console.log(e);
        }
    }

    async get(table,query,sort){
        let data =  await mongodbutil.getDb().collection( table ).find(query,{_id:0}).sort(sort).toArray();
        if(data[0]) {
            data.forEach(item => {
                delete item._id;
            });
        }
        return data;
    }
    async count(table,query){
        return await mongodbutil.getDb().collection( table ) .find(query).count();
    }
}

module.exports = DBhandler;
