let MongoClient = require( 'mongodb' ).MongoClient;
let url = 'mongodb://127.0.0.1:27017/admin';



async function run() {
    let db = await MongoClient.connect(url);
    let dbo = db.db('instagramData');
    await dbo.createCollection('userInfo');
    await dbo.createCollection('posts');
    await dbo.createCollection('comments');
    await dbo.createCollection('hashtags');
    await dbo.createCollection('postsArchive');
    await dbo.collection('userInfo').createIndex({ user: 1 });
    await dbo.collection('posts').createIndex({ id: 1 ,user:1});
    await dbo.collection('comments').createIndex({ id: 1 ,user:1});
    await dbo.collection('hashtags').createIndex({ hashtag: 1 });
	await dbo.collection('postsArchive').createIndex({ id: 1 ,date:1});
	console.log('creating dataBase and collections are succefully done');
}

run();
