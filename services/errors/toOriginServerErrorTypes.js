// import { AxiosError, AxiosResponse } from 'axios'
const { complement, cond, isNil, pipe, prop, propOr, T, whereEq } = require('ramda')
const {
    InternalServerError,
    LegacyOriginServerError,
    OriginServerError,
    OriginServerNetworkError,
    OriginServerTimeoutError
} = require('./errorTypes')
const { isJsonApiError } = require('./isJsonApiError')
const { getNetworkErrorInfo } = require('./networkErrors')

/*type Optional<X> = X | undefined | null
type OriginServerErrorTypes = LegacyOriginServerError
    | OriginServerError
    | OriginServerTimeoutError
    | OriginServerNetworkError*/

// R.complement is a function that invert the logic of another function.
// R.Nil check if something is undefined | null
const isNotNil = complement(isNil)

function toOriginServerError(error/*: AxiosResponse<JsonApiError>*/) {
    return new OriginServerError({
        httpStatusCode: error.status,
        message: error.statusText,
        payload: error.data,
        resourcePath: error.config.url,
        verb: error.config.method
    })
}

function toLegacyOriginServerError(error/*: AxiosResponse<any>*/) {
    return new LegacyOriginServerError({
        httpStatusCode: error.status,
        message: error.statusText,
        payload: error.data,
        resourcePath: error.config.url,
        verb: error.config.method
    })
}

function isResponseDataJsonApiError(response/*: Optional<AxiosResponse>*/) {
    // `R.pipe` passes data as a data pipline in left to right or top to bottom fashion,
    // where output of prior function is input of susequent function.
    // `R.propOr` checks if response has data property. If it does not,
    // it will default it to empty object, and pass it to the next called in the
    // chain isJsonApiError. It's okay to default to object in this case to avoid code blow up.
    return pipe(
        propOr({}, 'data'),
        isJsonApiError
    )(response)
}

function getAxiosResponse(error/*: AxiosError*/) {
    return prop('response', error)
}

function processServerResponse(error/*: AxiosError):
    OriginServerError | LegacyOriginServerError*/) {
    const response = getAxiosResponse(error)
    if (!response) {
        throw new InternalServerError({
            message: '@edge/errors/toOriginServerErrorTypes/processServerResponse: response is null & should never happen!'
        })
    }
    return isResponseDataJsonApiError(response)
        ? toOriginServerError(response)
        : toLegacyOriginServerError(response)
}

const hasResponseFromServer = pipe(getAxiosResponse, isNotNil)

function hasTimeoutError(error/*: AxiosError*/) {
    /**
     * `whereEq` Takes a spec object and a test object;
     * returns true if the test satisfies the spec.
     */
    return whereEq({
        code: 'ECONNABORTED',
        errno: undefined,
        isAxiosError: true
    })(error)
}

function humanizeTimeout(timeInMilliSecs/*: Optional<number>*/) {
    return timeInMilliSecs ? `${timeInMilliSecs} ms` : 'not set'
}

function processTimeoutError(error/*: AxiosError<any>*/) {
    return new OriginServerTimeoutError({
        message: error.message,
        resourcePath: error.config.url,
        verb: error.config.method,
        timeout: humanizeTimeout(error.config.timeout),
    })
}

function processNetworkError(error/*: AxiosError<any>*/) {
    const { description, detail } = getNetworkErrorInfo(error.code)
    return new OriginServerNetworkError({
        message: error.message,
        resourcePath: error.config.url,
        verb: error.config.method,
        timeout: humanizeTimeout(error.config.timeout),
        code: error.code,
        description,
        detail
    })
}

/**
 * Takes care of transforming AxiosError to one of the following:
 * `OriginServerError` : when 4xx or 5xx response with JsonApiError payload
 * `LegacyServerError` : when 4xx or 5xx response without JsonApiError payload
 * `OriginServerTimeoutError` : due to applicaton or socket level timeout
 * `OriginServerNetworkError` : captures all other errors
 * @param error - api error
 * @returns OriginServerErrorTypes
 */
function toOriginServerErrorTypes(error/*: AxiosError*/) {
    /* `R.cond` takes an array of an array of conditions where the first item of the array is
    a predicate and if its true it executes the corresponding logic associated with it.
    In this case `hasResponseFromServer` if true will execute processServerResponse logic.
    There is a catch all at the very bottom which is R.T which means (R.True), which will always
    execute processNetworkError when all fails.*/
    return cond/*<AxiosError, OriginServerErrorTypes>*/([
        [hasResponseFromServer, processServerResponse],
        [hasTimeoutError, processTimeoutError],
        [T, processNetworkError]
    ])(error)
}

module.exports = { toOriginServerErrorTypes, processServerResponse }