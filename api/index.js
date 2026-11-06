const { app } = require('../backend/server');

// Vercel Serverless Function entrypoint
module.exports = (req, res) => {
  return app(req, res);
};
