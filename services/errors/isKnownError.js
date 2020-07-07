const {
    DeveloperError,
    InternalServerError,
    LegacyOriginServerError,
    OriginServerError,
    OriginServerNetworkError,
    OriginServerTimeoutError,
    ContractBreachedError
} = require('./errorTypes')

module.exports = {
    isKnownError(error) {
        return error instanceof InternalServerError
        || error instanceof DeveloperError
        || error instanceof LegacyOriginServerError
        || error instanceof OriginServerError
        || error instanceof OriginServerNetworkError
        || error instanceof OriginServerTimeoutError
        || error instanceof ContractBreachedError
    }
}