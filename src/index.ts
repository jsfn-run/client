export interface RunOptions {
  name?: string;
  port?: number;
  local?: boolean;
  action?: string;
  options?: Record<string, string | number | boolean>;
  credentials?: Record<string, string>;
}

type Fn = (input: Blob) => Promise<Response>;

export function fn(runOptions: RunOptions): Fn {
  const options = runOptions.options || {};
  const functionName = runOptions.local ? '' : runOptions.name;
  const action = runOptions.action || '';
  const protocol = runOptions.local ? 'http://' : 'https://';
  const domain = runOptions.local ? 'localhost' : '.jsfn.run';
  const port = runOptions.local && runOptions.port ? ':' + runOptions.port : '';
  const searchParams = String(new URLSearchParams(Object.entries(Object(options))));
  const url = protocol + functionName + domain + port + '/' + action + '?' + searchParams;
  const headers: Record<string, string> = {};

  if (runOptions.credentials) {
    const token = btoa(JSON.stringify(runOptions.credentials));
    headers.authorization = 'Bearer ' + token;
  }

  return async function(body: Blob) {
    const response = await fetch(url, { body, method: 'POST', headers });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response;
  };
}

function toFn(o: RunOptions | Fn) {
  return o => typeof o === 'function' ? o : fn(o);
}

export async function pipe(...fns: Array<RunOptions | Fn>): Promise<Response> {
  if (!fns.length) {
    throw new Error('One or more steps must be provided');
  }

  if (fns.length === 1) {
    return toFn(fns[0])(input);
  }
  
  const steps = fns.map(toFn);
  const last = steps.pop();

  return async (input) => {
    let v = input;

    for (const fn of steps) {
      v = fn(v).body;
    }

    return last(v);
  };
}
