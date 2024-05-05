const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'BorTube API',
        description: 'The API for the BorTube backend.'
    },
    host: 'localhost:8000'
};

const outputFile = './public/swagger-output.json';
// const routes = ['./index.ts'];
const routes = ['./routes/*.ts'];
/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);