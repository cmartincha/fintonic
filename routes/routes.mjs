import express from 'express';
import ProductController from '../controllers/product_controller.mjs';
import BasicAuth from '../controllers/basic_auth.mjs';

const router = express.Router();

router.get('/product', ProductController.findAll)
    .post('/product', [BasicAuth.authenticate, ProductController.insert]);
router.get('/product/:productId', ProductController.findOne)
    .delete('/product/:productId',
        [BasicAuth.authenticate, ProductController.delete]);

export default router;