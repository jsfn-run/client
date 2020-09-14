import { RunOptions, pipe, fn } from '../src/index';

describe('pipe function calls', () => {
  it('should pipe multiple function calls together', async () => {
    const steps: RunOptions[] = [
      { name: 'yaml', action: 'encode' },
      { name: 'yaml', action: 'decode', credentials: { accessToken: 'deadbeef' } },
    ];

    const json = JSON.stringify({ number: 1 }, null, 2);
    const input = new Blob([json], { type: 'application/json' });
    const fetch = (window.fetch = jasmine.createSpy().and.callFake(() => Promise.resolve(new Response(input))));

    const response = await pipe(input, ...steps);

    expect(await response.text()).toBe(json);
    expect(fetch).toHaveBeenCalledWith('https://yaml.jsfn.run/encode?', { body: input, method: 'POST' });
    expect(fetch).toHaveBeenCalledWith('https://yaml.jsfn.run/decode?', {
      body: input,
      method: 'POST',
      headers: { Authorization: 'Bearer eyJhY2Nlc3NUb2tlbiI6ImRlYWRiZWVmIn0=' },
    });
  });

  it('should pipe the input to a local server', async () => {
    const json = JSON.stringify({ number: 1 }, null, 2);
    const input = new Blob([json], { type: 'application/json' });
    const fetch = (window.fetch = jasmine.createSpy().and.callFake(() => Promise.resolve(new Response(input))));

    const response = await fn({ local: true, port: 2233 })(input);

    expect(await response.text()).toBe(json);
    expect(fetch).toHaveBeenCalledWith('http://localhost:2233/?', { body: input, method: 'POST' });
  });

  it('should stop calls if one step returns an error', async () => {
    const input = new Blob(['Invalid input'], { type: 'text/plain' });
    const response = new Response(input, { status: 400, statusText: 'Error' });
    const fetch = (window.fetch = jasmine.createSpy().and.callFake(() => Promise.resolve(response)));
    const errorOutput = await pipe(input, { local: true }, { name: 'yaml', action: 'encode' }).catch((e) => e);

    expect(errorOutput).toBe('Invalid input');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost/?', { body: input, method: 'POST' });
  });
});
