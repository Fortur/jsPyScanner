const logger = require('./logger');

function asyncWrap(fn) {
    return function asyncUtilWrap(req, res, next, ...args) {
        const fnReturn = fn(req, res, next, ...args);
        return Promise.resolve(fnReturn).catch(err => {
            console.log(err);
            logger.error(err);
            res.status(err.status || 500).json({status: err.status, message: err.message});
        });
    };
}

module.exports = asyncWrap;
