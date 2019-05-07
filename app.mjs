import express from 'express';
import logger from 'morgan';
import routes from './routes/routes.mjs';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', [routes,
    (req, res, next) => {
        res.status(404);
        res.json({
            status: 'error',
            message: 'Not found'
        })
    }]);
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: 'error',
        data: err
    });
});

export default app;