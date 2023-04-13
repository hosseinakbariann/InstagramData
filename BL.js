// let mongoUtil = require( '../mongoUtil' );
// let db = mongoUtil.getDb();

let mongodbutil = require( '../mongoUtil' );

// Improve debugging
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
});

const seedUser = {
  name: 'Bob Alice',
  email: 'test@dev.null',
  bonusSetting: true
};

class BL {
  async testMongo(){
    try {
      mongodbutil.getDb().collection( 'users' ).insertOne(seedUser);
      console.log('success');
    }catch (e) {
      console.log(e);
    }
  }
}

module.exports=BL;