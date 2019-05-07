import {createModel} from '../db/mongo_db.mjs';

export default createModel('product', {
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});