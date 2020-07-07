const axios = require('axios')
const winston = require('winston')
// const path = require('path')
const { toOriginServerErrorTypes } = require('../errors/toOriginServerErrorTypes')
const { transformSafely } = require('../errors/transformSafely')
const tracer = require('dd-trace').init({
  logInjection: true,
  tags: {
    platform: 'edge-platform',
    abdul: 'khan'
  },
})
const { DeveloperError } = require('../errors/errorTypes')
const { isKnownError } = require('../errors/isKnownError')

const { createLogger } = require('@stockx/node-structured-logging-winston')

const logger = createLogger({
  logLevel: 'info',
  datadogTracer: tracer,
  application: process.env.DD_SERVICE,
  environment: process.env.DD_ENV
})

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/v1/input/092b9315dc2a26eb700330216f20fd78?ddsource=graphql&service=${process.env.DD_SERVICE}`,
  ssl: true
};

// logger.add(new winston.transports.File({
//   filename: '/home/parallels/datadog/log_file_to_monitor.log'
// }))

logger.add(new winston.transports.Http(httpTransportOptions))

// console.log('SHOW_STACK_TRACE_IN_ERRORS', process.env.SHOW_STACK_TRACE_IN_ERRORS === 'true')

const { ApolloServer, gql, UserInputError } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
// const { error } = require('winston')

const typeDefs = gql`
  type Review @key(fields: "id") {
    id: ID!
    body: String
    author: User @provides(fields: "username")
    product: Product
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String @external
    reviews: [Review]
  }

  extend type Product @key(fields: "upc") {
    upc: String! @external
    reviews: [Review]
  }
`;

const fooBarSchema = {
  type: 'object',
  properties: {
    foo: { type: 'string' }
  }
}

const toCatFoo = transformSafely({
  schema: fooBarSchema,
  url: '/client/Id/stuff',
  owners: ['mlp', 'shipping'],
  expectedType: 'FooBar'
}, (response) => {
  console.log('response yo', response)
  return { cat: response.foo }
})

const resolvers = {
  Review: {
    author(review) {
      return { __typename: "User", id: review.authorID };
    }
  },
  User: {
    async reviews(user) {
      return await withTimeoutError()
      // return await withContractBreachResponse()
      //  .then(toCatFoo)
      // throw new Error('What the heck dude')
      // throw new UserInputError('what the heck ya', { foo: 'bar' })
      // throw new DeveloperError({ message: 'something went wrong yo!' })
      // return reviews.filter(review => review.authorID === user.id);
    },
    numberOfReviews(user) {
      return reviews.filter(review => review.authorID === user.id).length;
    },
    username(user) {
      const found = usernames.find(username => username.id === user.id);
      return found ? found.username : null;
    }
  },
  Product: {
    reviews(product) {
      return reviews.filter(review => review.product.upc === product.upc);
    }
  }
};

const getUserAgent = (request) => {
  return request.http.headers.get('user-agent')
}

const getDDTraceId = (request) => {
  return request.http.headers.get('x-datadog-trace-id')
}


const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]),
  debug: process.env.SHOW_STACK_TRACE_IN_ERRORS === 'true',
  logger,
  // engine: {
  //   rewriteError(error) {
  //     console.log('rewriteError', Object.keys(error))
  //   }
  // },
  // formatError(error) {
  //   // console.log('formatError', JSON.stringify(error))
  //   // return {
  //   //   message: error.message,
  //   //   locations: error.locations,
  //   //   path: error.path,
  //   //   extensions: {
  //   //     ...error.extensions,
  //   //     exception: {
  //   //       stacktrace: ['<redacted: check logs>']
  //   //     }
  //   //   }
  //   // }
  //   // console.log('traceId', error.traceId)
  //   // return {
  //   //   ...error,
  //   //   extensions: { code: error.extensions.code, traceId: error.traceId }
  //   // }
  // },
  plugins: [
    {
      requestDidStart(context) {
        // const traceId = trace.scope().active().context().toTraceId()
        // context.context.traceId = getDDTraceId(context.request)
        return {
          didResolveSource() {
            // console.log('didResolveSource')
          },
          parsingDidStart() {
            return (errors) => {
              // console.log('parsingDidStart errors', errors)
            }
          },
          validationDidStart(context) {
            return (error) => {
              // console.log('validationDidStart errors', error)
            }
          },
          didResolveOperation() {
            // console.log('didResolveOperation')
          },
          responseForOperation() {
            // console.log('responseForOperation')
          },
          executionDidStart(context) {
            return (error) => {
              // console.log('executionDidStart error', error)
            }
          },
          didEncounterErrors(context) {
            // const userAgent = getUserAgent(context.request)
            const traceId = getDDTraceId(context.request)
            if (context.errors) {
              context.errors.forEach(error => {
                error.extensions.traceId = traceId
                if (isKnownError(error.originalError)) {
                  console.log('isKnownError')
                  context.logger.log('error', {
                    ...error.originalError.log(),
                    ...error.originalError.extensions,
                    stack: error.stack
                  })
                  // error.originalError = new Error(error.originalError.message)
                } else {
                  console.log('unknownError')
                  context.logger.log('error', {
                    code: 'UNKOWN_ERROR',
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                  })
                }
              })
            }
            // context.errors = context.errors.map(error => {
            //   return {
            //     ...error,
            //     originalError: new Error('yolo'),
            //     extensions: {
            //       code: error.extensions.code,
            //       traceId,
            //       userAgent
            //     },
            //   }
            // })
            console.log(Object.keys(context.errors[0].extensions))
          },
          willSendResponse(context) {
            // console.log('willSendResponse ctx', Object.keys(context))
            // if (!Array.isArray(context.errors)) return context
            // context.errors.forEach(error => {
            //   console.log('in forEach errors loop')
            //   if (error && error.originalError) {
            //     error.originalError = new Error('yolo')
            //   }
            // })
          }
        }
      }
    }
  ]
});

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const withTimeoutError = () => {
  return axios.get('www.google.ca', {
    timeout: 1
  }).catch((error) => {
    throw toOriginServerErrorTypes(error) })
}

const withContractBreachResponse = async () => {
  return { foo: 123 }
}

const usernames = [
  { id: "1", username: "@ada" },
  { id: "2", username: "@complete" }
];
const reviews = [
  {
    id: "1",
    authorID: "1",
    product: { upc: "1" },
    body: "Love it!"
  },
  {
    id: "2",
    authorID: "1",
    product: { upc: "2" },
    body: "Too expensive."
  },
  {
    id: "3",
    authorID: "2",
    product: { upc: "3" },
    body: "Could be better."
  },
  {
    id: "4",
    authorID: "2",
    product: { upc: "1" },
    body: "Prefer something else."
  }
];
