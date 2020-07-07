// tslint:disable: max-classes-per-file
const { ApolloError } = require('apollo-server-errors');
// const { takeLastWhile } = require('ramda');

class InternalServerError extends ApolloError {
    constructor(error  /*:{ message: string } */) {
        super(error.message, 'INTERNAL_SERVER_ERROR');
        Object.defineProperty(this, 'name', { value: 'InternalServerError' })
    }
    log() {
        return {
            type: this.name,
            message: this.message
        }
    }
    response() {
        return {
            type: this.name,
            message: this.message,
        }
    }
}

/**
 * Represents an Error that encapsulates 4xx, 5xx Client/Server HTTP Errors that does not
 * contains standard JSON-API formatted error
 */
class LegacyOriginServerError extends ApolloError {
    constructor(error/*: {
        message: string,flogZZ
        payload: any,
        httpStatusCode: number,
        resourcePath?: string,
        verb?: string
    } */) {
        const { message, payload, httpStatusCode = 500, resourcePath, verb } = error
        super(message, 'LEGACY_ORIGIN_SERVER_ERROR', {
            httpStatusCode,
            payload,
            resourcePath,
            verb
        });
        Object.defineProperty(this, 'name', { value: 'LegacyOriginServerError' });
    }

    log() {
        return {
            type: this.name,
            message: this.message,
            httpStatusCode: this.httpStatusCode,
            payload: this.payload,
            resourcePath: this.resourcePath,
            verb: this.verb
        }
    }
}

/**
 * Represents an Error that encapsulates 4xx, 5xx Client/Server HTTP Errors that
 * contains standard JSON-API formatted error
 */
class OriginServerError extends ApolloError {
    constructor(error/*: {
        message: string,
        payload: { errors: Array<{ status: number; title: string; detail: string }> },
        httpStatusCode: number,
        resourcePath?: string,
        verb?: string
    }*/) {
        const { message, payload, httpStatusCode = 500, resourcePath, verb } = error
        super(message, 'ORIGIN_SERVER_ERROR', {
            httpStatusCode,
            payload,
            resourcePath,
            verb,
            name: 'OriginServerError'
        });
    }
    log() {
        return {
            type: this.name,
            message: this.message,
            httpStatusCode: this.httpStatusCode,
            payload: this.payload,
            resourcePath: this.resourcePath,
            verb: this.verb
        }
    }

}

/**
 * Error that represents and instance of Error caused due to Application
 * timeout specifically by Axios.
 */
class OriginServerTimeoutError extends ApolloError {
    constructor(error/*: {
        message: string,
        resourcePath?: string,
        verb?: string,
        timeout?: string
    }*/) {
        const { message, resourcePath, verb, timeout } = error
        super(message, 'ORIGIN_SERVER_TIMEOUT_ERROR', {
            resourcePath,
            verb,
            timeout
        })
        Object.defineProperty(this, 'name', { value: 'OriginServerTimeoutError' });
    }
    log() {
        return {
            type: this.name,
            message: this.message,
            resourcePath: this.resourcePath,
            verb: this.verb,
            timeout: this.timeout
        }
    }
}

/**
 * Any error that is not a 4xx, 5xx or Timeout error will be respresented
 * by OriginServerNetworkError
 */
class OriginServerNetworkError extends ApolloError {
    constructor(error/*: {
        message: string,
        resourcePath?: string,
        verb?: string,
        timeout?: string,
        code?: string
        type: NetworkErrorType,
        description: string,
        detail: string,
    }*/) {
        const { code, message, resourcePath, verb, timeout, type, description, detail } = error
        super(message, 'ORIGIN_SERVER_NETWORK_ERROR', {
            resourcePath,
            verb,
            timeout,
            code,
            type,
            description,
            detail
        })
    }

    log() {
        return {
            type: this.code,
            message: this.message,
            resourcePath: this.resourcePath,
            verb: this.verb,
            timeout: this.timeout,
            code: this.code,
            description: this.description,
            detail: this.detail,
        }
    }
}

/**
 * Represents an Error that encapuslates and error that a developer
 * would make while integrating with the graph such as missing arguments
 * that is absolutely needed by backend service.
 */
class DeveloperError extends ApolloError {
    constructor(error) {
        super(error.message, 'DEVELOPER_ERROR');
        Object.defineProperty(this, 'name', { value: 'DeveloperError' });
    }

    log() {
        return {
            type: this.name,
            message: this.message
        }
    }
}

class ContractBreachedError extends ApolloError {
    constructor(data/*:{
        expectedType: string,
        urlOrId: string,
        owners: string[],
        sourceResponse: unknown,
        error: typeof Error | string
    }*/) {
        const { expectedType, urlOrId, owners, sourceResponse, error } = data
        const message = `${expectedType}_CONTRACT_BREACHED`
        super(message, 'CONTRACT_BREACHED_ERROR', {
            expectedType,
            urlOrId,
            owners,
            sourceResponse,
            error
        });
        Object.defineProperty(this, 'name', { value: 'ContractBreachedError' });
    }
    log() {
        return {
            expectedType: this.expectedType,
            urlOrId: this.urlOrId,
            owners: this.owners,
            sourceResponse: this.sourceResponse,
            error: this.error
        }
    }
}

module.exports = {
    DeveloperError,
    InternalServerError,
    LegacyOriginServerError,
    OriginServerError,
    OriginServerTimeoutError,
    OriginServerNetworkError,
    ContractBreachedError
}
