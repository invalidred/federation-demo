const tracer = require('dd-trace').init({
  logInjection: true,
  tags: {},
})

const { createLogger } = require('@stockx/node-structured-logging-winston')
const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");
const { FormatErrorWithContextExtension } = require('graphql-format-error-context-extension')

const logger = createLogger({
  logLevel: 'info',
  datadogTracer: tracer
})

const gateway = new ApolloGateway({
  // This entire `serviceList` is optional when running in managed federation
  // mode, using Apollo Graph Manager as the source of truth.  In production,
  // using a single source of truth to compose a schema is recommended and
  // prevents composition failures at runtime using schema validation using
  // real usage-based metrics.
  serviceList: [
    { name: "accounts", url: "http://localhost:4001/graphql" },
    { name: "reviews", url: "http://localhost:4002/graphql" },
    { name: "products", url: "http://localhost:4003/graphql" },
    { name: "inventory", url: "http://localhost:4004/graphql" }
  ],

  // Experimental: Enabling this enables the query plan view in Playground.
  __exposeQueryPlanExperimental: false,
});

// const getDDTraceId = (request) => {
//   console.log('getDDTraceId', Object.keys(request))
//   return '133'
//   // return request.http.headers.get('x-datadog-trace-id')
// }

// const formatError2 = (error, context) => {
//   console.log('this is formatError2')
//   console.log('context', Object.keys(context))
//   const traceId = '12312'
//   return {
//     ...error,
//     extensions: { code: error.extensions.code, traceId: getDDTraceId(context.request) }
//   }
// };

(async () => {
  const server = new ApolloServer({
    gateway,

    // Apollo Graph Manager (previously known as Apollo Engine)
    // When enabled and an `ENGINE_API_KEY` is set in the environment,
    // provides metrics, schema management and trace reporting.
    engine: false,
    debug: process.env.SHOW_STACK_TRACE_IN_ERRORS === 'true',
    // Subscriptions are unsupported but planned for a future Gateway version.
    subscriptions: false,
    // extensions: [() => new FormatErrorWithContextExtension(formatError2)],
    // context: () => {
    //   throw new Error('yo')
    //   return {
    //     foo: 'bar'
    //   }
    // },
    formatError(error) {
      console.log('formatError', JSON.stringify(error))
      console.log('formatError', Object.keys(error))
      if (process.env.SHOW_STACK_TRACE_IN_ERRORS === 'true') {
        return error
      }
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: {
          code: error.extensions.code,
          traceId: error.extensions.traceId,
          exception: {
            stacktrace: [
              `https://app.datadoghq.com/apm/trace/${error.extensions.traceId}`
            ]
          }
        }
      }
      // return error
      // console.log('this is the current formatError Yo!')
    },
    // plugins: [
    //   {
    //     requestDidStart() {
    //       return {
    //         didEncounterErrors(requestContext) {
    //           console.log('didEncounterErrors')
    //           const context = requestContext.context;
    //           for (const error of requestContext.errors) {
    //             const err = error.originalError || error;
    //             console.log('originalError', Object.keys(error))
    //             err.traceId = '123213';
    //           }
    //           console.log('didEncounterErrors', Object.keys(requestContext.errors[0]))
    //           return;
    //         }
    //       }
    //     }
    //   }
    // ]
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
