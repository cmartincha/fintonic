import Product from '../models/product.mjs';
import DBG from 'debug';

export default class ProductController {

  static async insert(req, res, next) {
    const debug = DBG('fintonic:ProductController:insert');

    try {
      const product = await Product.create(
          {name: req.body.name, description: req.body.description});
      debug({data: JSON.stringify(product)});
      return res.json({
        status: 'success',
        message: 'Product created',
        data: product,
      });
    } catch (error) {
      ProductController.handleError(debug, error, res);
    }
  }

  static async findAll(req, res, next) {
    const debug = DBG('fintonic:ProductController:findAll');
    try {
      const products = await Product.find().lean();
      debug({data: JSON.stringify(products)});
      return res.json({
        status: 'success',
        message: 'Products found',
        data: products,
      });
    } catch (error) {
      ProductController.handleError(debug, error, res);
    }
  }

  static async findOne(req, res, next) {
    const debug = DBG('fintonic:ProductController:findOne');

    try {
      const data = await Product.findById(req.params.productId).lean();
      debug({data: JSON.stringify(data)});

      if (data) {
        return res.json({
          status: 'success',
          message: 'Product found',
          data: data,
        });
      }

      res.status(404);
      return res.json({
        status: 'error',
        message: `Product ${req.params.productId} not found`,
      });
    } catch (error) {
      ProductController.handleError(debug, error, res);
    }
  }

  static async delete(req, res, next) {
    const debug = DBG('fintonic:ProductController:delete');

    try {
      const data = await Product.findByIdAndDelete(req.params.productId).lean();
      debug({data: JSON.stringify(data)});

      if (data) {
        return res.json({
          status: 'success',
          message: 'Produce deleted',
          data: data,
        });
      }

      res.status(404);
      return res.json({
        status: 'error',
        message: `Product ${req.params.productId} not found`,
      });
    } catch (error) {
      ProductController.handleError(debug, error, res);
    }
  }

  static handleError(debug, error, res) {
    debug({error: JSON.stringify(error)});

    res.status(500);
    res.json({
      status: 'error',
      data: error,
    });
  }
}