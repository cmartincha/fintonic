import mongoose from 'mongoose';

class MongoDB {
  constructor() {
    this._db = null;
    this._connection = null;
  }

  async connect(url, db) {
    if (!this._connection) {
      await mongoose.connect(`mongodb://${url}/${db}`, {useNewUrlParser: true});
      this._connection = mongoose.connection;
      this._db = this._connection.db;
    }
  }

  async close() {
    if (this._connection) {
      await this._connection.close();
      this._connection = null;
      this._db = null;
    }
  }

  async dropDatabase() {
    if (this._db) {
      await this._db.dropDatabase();
    }
  }
}

export default function() { return new MongoDB(); }
export const createModel = (name, schema) => {
  return mongoose.model(name, mongoose.Schema(schema));
};