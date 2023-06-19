const cloudDomain = '.jsfn.run';

export interface RunOptions {
  name?: string;
  port?: number;
  local?: boolean;
  action?: string;
  options?: Record<string, string | number | boolean>;
  credentials?: Record<string, string>;
}

export function fn(runOptions: RunOptions): (input: Blob) => Promise<Response> {
  const options = runOptions.options || {};
  const functionName = runOptions.local ? '' : runOptions.name;
  const action = runOptions.action || '';
  const protocol = runOptions.local ? 'http://' : 'https://';
  const domain = runOptions.local ? 'localhost' : cloudDomain;
  const port = runOptions.local && runOptions.port ? ':' + runOptions.port : '';
  const searchParams = String(new URLSearchParams(Object.entries(Object(options))));
  const url = protocol + functionName + domain + port + '/' + action + '?' + searchParams;
  const headers: Record<string, string> = {};

  if (runOptions.credentials) {
    const token = btoa(JSON.stringify(runOptions.credentials));
    headers.authorization = 'Bearer ' + token;
  }

  return async function (body: Blob) {
    const response = await fetch(url, { body, method: 'POST', headers });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response;
  };
}

export async function pipe(input: Response | Blob, ...streams: RunOptions[]): Promise<Response | Blob> {
  let last: Response | Blob = input;

  for (const step of streams) {
    last = await fn(step)(await toBlob(last));
  }

  return last;
}

function toBlob(input: Blob | Response): Promise<Blob> {
  return input instanceof Blob ? Promise.resolve(input) : input.blob();
}
