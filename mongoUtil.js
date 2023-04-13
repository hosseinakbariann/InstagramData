let MongoClient = require( 'mongodb' ).MongoClient;
let _db;
let url = 'mongodb://127.0.0.1:27017/admin';
module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect( url, function( err, client ) {
      _db = client.db("instagramData");
      return callback( err );
    } );
  },
  getDb: function() {
    return _db;
  }
};
