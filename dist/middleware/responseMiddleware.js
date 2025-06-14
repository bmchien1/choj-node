"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseMiddleware = (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        // Ensure TypeORM objects are serialized correctly
        const formattedData = JSON.parse(JSON.stringify(data));
        return originalJson.call(this, formattedData);
    };
    next();
};
exports.default = responseMiddleware;
