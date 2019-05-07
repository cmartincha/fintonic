// import bcrypt from 'bcrypt';

export default class BasicAuth {

  static async authenticate(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || authorizationHeader.indexOf('Basic') === -1) {
      return BasicAuth.errorResponse(res, 'Missing header auth');
    }

    const base64Credentials = authorizationHeader.split(' ')[1];
    const [user, password] = Buffer.from(base64Credentials, 'base64')
        .toString('ascii').split(':');

    if (!BasicAuth.isOk(user, password)) {
      return BasicAuth.errorResponse(res, 'Bad credentials');
    }

    next();
  }

  static isOk(user, pass) {
    return credentials.user === user && pass === credentials.pass;
  }

  static errorResponse(res, message) {
    res.status(401);
    res.set('WWW-Authenticate', 'Basic');

    return res.json({
      status: 'error',
      message: message,
    });
  }
}