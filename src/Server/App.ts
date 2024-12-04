import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { match } from 'path-to-regexp';

type Request = IncomingMessage;
type Response = ServerResponse<IncomingMessage> & {
  req: IncomingMessage;
};

type ReqRes = {
  request: Request;
  response: Response;
};

type ReqResNext = ReqRes & {
  next: () => void;
};

type CallbackServer = (method: ReqResNext) => void;

type MethodVerbs = 'GET' | 'POST';

type Endpoint = {
  callbacks: CallbackServer[];
  method: MethodVerbs;
  url: string;
};

type EndpointUrl = string;

const METHODS = { GET: 'GET', POST: 'POST' };

class App {
  server: Server;
  private endpoints: Map<EndpointUrl, Endpoint> = new Map();

  constructor() {
    this.server = createServer();
  }

  listen(port: number) {
    this.build();
    this.server.listen(port);
  }

  get(url: string, ...callbacks: CallbackServer[]) {
    this.endpoints.set(`${METHODS.GET}:${url}`, {
      callbacks: callbacks,
      method: 'GET',
      url,
    });
  }

  post(url: string, ...callbacks: CallbackServer[]) {
    this.endpoints.set(`${METHODS.POST}:${url}`, {
      callbacks: callbacks,
      method: 'POST',
      url,
    });
  }

  private exec(callback: CallbackServer[], reqRes: ReqRes, index: number = 0) {
    const max = callback.length - 1;

    if (index > max) return;

    callback[index]({
      request: reqRes.request,
      response: reqRes.response,
      next: () => this.exec(callback, reqRes, index + 1),
    });
  }

  private getEndpoint(url: string, method: string): Endpoint | undefined {
    for (let key of this.endpoints.keys()) {
      const keyPosition = key.indexOf(':');
      const path = key.substring(keyPosition + 1);

      const hasMatch = match(path)(url);

      if (!hasMatch) continue;

      const endpoint = this.endpoints.get(key);

      if (endpoint?.method !== method) return undefined;

      return endpoint;
    }

    return undefined;
  }

  private extractParams(request: Request, endpoint: Endpoint) {
    const matcher = match(endpoint.url)(request.url!);

    Object.assign(request, {});
  }

  private build() {
    this.server.addListener('request', (request, response) => {
      const { url, method } = request;
      if (!url || !method) return response.end();

      const endpoint = this.getEndpoint(url, method);

      if (!endpoint) return response.end();

      this.exec(endpoint.callbacks, { request, response });
    });
  }
}

export { App };
