import { createReadStream, statSync } from 'fs';
import { Server } from 'http';

//This file is not part of code, is just and studing case of returning partial data, on demand following header implementation

export function streamFileRequest(server: Server) {
  server.addListener('request', (request, response) => {
    console.log('request yoo');
    const stats = statSync('./yarn.lock');

    const { size } = stats;
    const filePath = './yarn.lock';

    const range = request.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : size - 1;

      if (start >= size || end >= size) {
        response.writeHead(416, {
          'Content-Range': `bytes */${size}`,
        });
        return response.end();
      }

      response.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'text/html',
      });

      const stream = createReadStream(filePath, { start, end });
      stream.pipe(response);
    } else {
      response.writeHead(200, {
        'Content-Length': size,
        'Content-Type': 'text/html',
      });
      createReadStream(filePath).pipe(response);
    }
  });
}
