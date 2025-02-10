"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeError = void 0;
class TradeError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'TradeError';
    }
    static fromResponse(error) {
        const message = error.message || 'Unknown error';
        const statusCode = error.response?.status;
        return new TradeError(message, statusCode);
    }
}
exports.TradeError = TradeError;
TradeError.COMMODITY_NOT_FOUND = 'Commodity not found. Please check the spelling and try again.';
TradeError.RATE_LIMITED = 'Too many requests. Please try again in a few minutes.';
TradeError.NETWORK_ERROR = 'Unable to connect to trade website. Please try again later.';
