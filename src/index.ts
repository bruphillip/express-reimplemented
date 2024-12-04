import { App } from './Server/App';

const app = new App();

app.get(
  '/user/:name',
  ({ next }) => {
    console.log('[GET]: first middleware');
    next();
  },
  ({ next }) => {
    console.log('[GET]: second middleware');
    next();
  },
  ({ request, response }) => {
    response.end('request get /user/name');
  }
);

app.post(
  '/',
  ({ next }) => {
    console.log('[POST]: first middleware');
    next();
  },
  ({ next }) => {
    console.log('[POST]: second middleware');
    next();
  },
  ({ request, response }) => {
    response.end('request to post /');
  }
);

app.listen(3000);
