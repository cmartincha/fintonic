require = require('esm')(module, {'mode': 'auto'});

const DBG = require('debug');
const describe = require('mocha').describe;
const assert = require('chai').assert;
const app = require('../app').default;
const database = require('../db/mongo_db').default;
const http = require('http');
const Product = require('../models/product').default;
const request = require('supertest');

global.credentials = {
  user: 'fint',
  pass: 'test',
};

process.on('uncaughtException', async err => {
  handleGlobalErrors(err);
});
process.on('unhandledRejection', async err => {
  handleGlobalErrors(err);
});

function handleGlobalErrors(err) {
  const error = DBG('fintonic:test:error');

  error({error: JSON.stringify(err)});
}

describe('Test API requests', function() {
  const db = database();

  before(async function() {
    const info = DBG('fintonic:test:before');

    app.set('port', process.env.PORT);
    http.createServer(app);
    info(`Server listening at localhost:${process.env.PORT}`);

    await db.connect(process.env.DB_URL, process.env.DB_NAME);
    info(`Connected with DB ${process.env.DB_URL}/${process.env.DB_NAME}\n`);
  });

  after(async function() {
    await db.close();
  });

  afterEach(async function() {
    await db.dropDatabase();
  });

  it('Should return 404', async function() {
    const response = await request(app)
        .get('/fake')
        .expect(404);

    assert.equal(response.body.status, 'error');
  });

  it('Should return 3 products', async function() {
    const products = [
      await Product.create({
        name: 'Name 1',
        description: 'Description 1',
      }),
      await Product.create({
        name: 'Name 2',
        description: 'Description 2',
      }),
      await Product.create({
        name: 'Name 3',
        description: 'Description 3',
      }),
    ];

    const response = await request(app)
        .get('/product')
        .expect('Content-Type', /json/)
        .expect(200);

    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.length, products.length);
    assert.deepEqual(products.map(
        p => { return [p._id.toString(), p.name, p.description]; },
        ),
        response.body.data.map(
            p => { return [p._id, p.name, p.description]; },
        ));
  });

  it('Should return empty list', async function() {
    const response = await request(app)
        .get('/product')
        .expect('Content-Type', /json/)
        .expect(200);

    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.length, 0);
  });

  it('Should create a new product', async function() {
    const response = await request(app)
        .post('/product')
        .auth(credentials.user, credentials.pass)
        .type('json')
        .send({
          name: 'new product name',
          description: 'new product description',
        })
        .expect('Content-Type', /json/)
        .expect(200);

    assert.equal(response.body.status, 'success');
    const product = await Product.findById(response.body.data._id);
    assert.isNotNull(product);
    assert.deepEqual([product.id.toString(), product.name, product.description],
        [response.body.data._id, response.body.data.name, response.body.data.description]);
  });

  it('Should create a new product with no description', async function() {
    const response = await request(app)
        .post('/product')
        .auth(credentials.user, credentials.pass)
        .type('json')
        .send({
          name: 'new product name',
        })
        .expect('Content-Type', /json/)
        .expect(200);

    assert.equal(response.body.status, 'success');
    const product = await Product.findById(response.body.data._id);
    assert.isNotNull(product);
    assert.deepEqual([product.id.toString(), product.name, product.description],
        [response.body.data._id, response.body.data.name, response.body.data.description]);
  });

  it('Should fail when try to create a product with no name', async function() {
    const response = await request(app)
        .post('/product')
        .auth(credentials.user, credentials.pass)
        .type('json')
        .send({description: 'new product description'})
        .expect('Content-Type', /json/)
        .expect(500);

    assert.equal(response.body.status, 'error');
  });

  it('Should return a single product', async function() {
    const product = await Product.create({
      name: 'name',
      description: 'description',
    });
    const productId = product._id.toString();

    const response = await request(app)
        .get(`/product/${productId}`)
        .expect('Content-Type', /json/)
        .expect(200);

    assert.equal(response.body.status, 'success');
    const data = response.body.data;
    assert.deepEqual(
        [product._id.toString(), product.name, product.description],
        [data._id, data.name, data.description]);
  });

  it('Should return nothing', async function() {
    const fakeId = '5cc808bd028fcc24aced7b66';
    const response = await request(app)
        .get(`/product/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(404);

    assert.equal(response.body.status, 'error');
  });

  it('Should delete a single product', async function() {
    const productToDelete = await Product.create({
      name: `delete name`,
      description: `delete description`,
    });
    const productToKeep = await Product.create({
      name: `New product name`,
      description: `New product description`,
    });
    const productToDeleteId = productToDelete._id.toString();
    const productToKeepId = productToKeep._id.toString();

    const response = await request(app)
        .delete(`/product/${productToDeleteId}`)
        .auth(credentials.user, credentials.pass)
        .expect('Content-Type', /json/)
        .expect(200);

    assert.equal(response.body.status, 'success');

    assert.isNull(await Product.findById(productToDeleteId));
    assert.isNotNull(await Product.findById(productToKeepId));
  });

  it('Should fail when try to delete non-existent product', async function() {
    const fakeId = '5cc808bd028fcc24aced7b66';
    const response = await request(app)
        .delete(`/product/${fakeId}`)
        .auth(credentials.user, credentials.pass)
        .expect('Content-Type', /json/)
        .expect(404);

    assert.equal(response.body.status, 'error');
  });

  it('Should fail auth beacuse no auth header', async function() {
    let response = await request(app)
        .delete(`/product/test`)
        .expect('Content-Type', /json/)
        .expect(401);

    assert.equal(response.body.status, 'error');
    assert.equal(response.headers['www-authenticate'], 'Basic');

    response = await request(app)
        .post(`/product`)
        .expect('Content-Type', /json/)
        .expect(401);

    assert.equal(response.body.status, 'error');
    assert.equal(response.headers['www-authenticate'], 'Basic');
  });

  it('Should fail beacuse bad credentials', async function() {
    let response = await request(app)
        .delete(`/product/test`)
        .auth('bad_user', credentials.pass)
        .expect('Content-Type', /json/)
        .expect(401);

    assert.equal(response.body.status, 'error');
    assert.equal(response.headers['www-authenticate'], 'Basic');

    response = await request(app)
        .delete(`/product/test`)
        .auth(credentials.user, 'bad_pass')
        .expect('Content-Type', /json/)
        .expect(401);

    assert.equal(response.body.status, 'error');
    assert.equal(response.headers['www-authenticate'], 'Basic');

    response = await request(app)
        .delete(`/product/test`)
        .auth('bad_user', 'bad_pass')
        .expect('Content-Type', /json/)
        .expect(401);

    assert.equal(response.body.status, 'error');
    assert.equal(response.headers['www-authenticate'], 'Basic');
  });
});