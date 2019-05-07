#!/usr/bin/env node

import app from '../app.mjs';
import database from '../db/mongo_db.mjs';
import http from 'http';
import DBG from 'debug';

// Credentials for auth
global.credentials = {
  user: 'fint',
  pass: 'test',
};

function handleGlobalErrors(err) {
  const error = DBG('fintonic:error');

  error({error: JSON.stringify(err)});
}

(async () => {
  const debug = DBG('fintonic:www');
  const db = database();

  try {
    // Process listeners
    process.on('uncaughtException', err => {
      handleGlobalErrors(err);
    });
    process.on('unhandledRejection', err => {
      handleGlobalErrors(err);
    });
    process.on('exit', async ()=> {
      await db.close();
    });

    // HTTP server
    const port = process.env.PORT || 3000;
    app.set('port', port);

    const server = http.createServer(app);
    server.listen(port);
    server.on('close', async () => {
      await db.close();
    });
    debug(`Server listening at localhost:${process.env.PORT}`);

    // DB
    await db.connect(process.env.DB_URL || 'localhost',
        process.env.DB_NAME || 'fintonic');
    debug(`Connected to BD at ${process.env.DB_URL}/${process.env.DB_NAME}`);
  } catch (err) {
    handleGlobalErrors(err);
    process.exit(-1);
  }
})();