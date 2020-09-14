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
  const searchParams = String(new URLSearchParams(Object.entries(Object(options))));
  const url = protocol + functionName + domain + '/' + action + '?' + searchParams;
  let headers: Record<string, string>;

  if (runOptions.credentials) {
    const token = btoa(JSON.stringify(runOptions.credentials));
    headers = { Authorization: 'Bearer ' + token };
  }

  return (body: Blob) => fetch(url, { body, method: 'POST', ...(headers && { headers }) }).then(onFetch);
}

function onFetch(response: Response) {
  if (!response.ok) {
    return Promise.reject(response.text());
  }

  return response;
}

export function pipe(input: Response | Blob | Promise<Response | Blob>, ...streams: RunOptions[]): Promise<Response> {
  return streams.reduce((previous, next) => run(previous, next), toPromise(input));
}

function run(input: Promise<Response | Blob>, options: RunOptions): Promise<Response> {
  return toPromise(input).then(toBlob).then(fn(options));
}

function toBlob(input: Blob | Response) {
  return input instanceof Blob ? input : input.blob();
}

function toPromise(input) {
  return input instanceof Promise ? input : Promise.resolve(input);
}
