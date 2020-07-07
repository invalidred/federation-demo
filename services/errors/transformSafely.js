const Ajv = require('ajv')
// import { JSONSchema7 } from 'json-schema'
const { ContractBreachedError } = require("./errorTypes")

/*interface SourceInfo {
    schema?: JSONSchema7,
    urlOrId: string,
    expectedType: string,
    owners: string[]
}*/

/*type TransformFn<T, S> = (data: T) => S*/

const ajv = new Ajv({ allErrors: true })

/**
 * Safely transforms one type to another type without causing runtime error.
 * The intended use case is when transforming data recieved from
 * API call or Lambda invocation, wrap the transformation function
 * within transformSafely providing it `SourceInfo` & transformation function
 * This return another function to which you can pass you data to begin transformation.
 * @param sourceInfo
 * @param transformFn
 */
function transformSafely(/*<T, S>(*/
    sourceInfo/*: SourceInfo*/, transformFn/*: TransformFn<T, S>*/
) {
    const validate = sourceInfo.schema ? ajv.compile(sourceInfo.schema) : undefined
    /**
     * returns a function that accepts data which will
     * 1. if `sourceInfo.schema` (JSONSchema) is provided will check against it for contract breach
     * 2. will wrap transformation around `try/catch` and will throw ContractBreachedError if there 
     *    is runtime error
     */
    return function withData(data/*: T*/) {
        console.log('hey here with data', data)
        if (validate && !validate(data)) {
            console.log('data does not match schema')
            throw new ContractBreachedError({
                expectedType: sourceInfo.expectedType,
                urlOrId: sourceInfo.urlOrId,
                owners: sourceInfo.owners,
                sourceResponse: data,
                error: ajv.errorsText(validate.errors)
            })
        }
        try {
            console.log('before calling transformation fn')
            return transformFn(data)
        } catch (error) {
            throw new ContractBreachedError({
                expectedType: sourceInfo.expectedType,
                urlOrId: sourceInfo.urlOrId,
                owners: sourceInfo.owners,
                sourceResponse: data,
                error
            })
        }
    }
}

module.exports = { transformSafely }