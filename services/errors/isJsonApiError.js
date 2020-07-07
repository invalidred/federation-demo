const Ajv = require('ajv')

/*export interface JsonApiError {
    errors: Array<{ status: number; title: string; detail: string }>
}*/

const jsonApiErrorSchema = {
    type: 'object',
    required: ['errors'],
    additionalProperties: false,
    properties: {
        errors: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['status', 'title', 'detail'],
                properties: {
                    status: { type: 'number' },
                    title: { type: 'string' },
                    detail: { type: 'string' }
                }
            }
        }
    }
}

const ajv = new Ajv()
const validate = ajv.compile(jsonApiErrorSchema)

/**
 * Indicates whether a given error is JSONApiError compliant.
 * https://stockx-services.atlassian.net/wiki/spaces/EN/pages/344391869/JSON+API+Standards
 * @param payload - to veify if it's an instance of jsonApiError
 * @returns {boolean} true when error is JsonApiError shape
 */
function isJsonApiError(error) /*: any): boolean */ {
    return validate(error) /*as boolean*/
}

module.exports = {
    isJsonApiError
}