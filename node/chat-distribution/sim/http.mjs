// A tiny HTTP client: every call carries the simulated time and never throws.

export function createClient(baseUrl) {
    const problems = [];
    let serverErrors = 0;
    let requests = 0;

    async function call(method, path, now, body) {
        requests += 1;

        const headers = { 'x-sim-time': now };

        if (body !== undefined) {
            headers['content-type'] = 'application/json';
        }

        let response = null;

        try {
            response = await fetch(baseUrl + path, {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: AbortSignal.timeout(5000),
            });
        } catch (error) {
            serverErrors += 1;
            remember(`${method} ${path}: no answer (${error.cause?.code ?? error.name})`);

            return { ok: false, status: 0, data: null };
        }

        let data = null;
        const text = await response.text();

        if (text.length > 0) {
            try {
                data = JSON.parse(text);
            } catch {
                data = null;
            }
        }

        if (response.status >= 500) {
            serverErrors += 1;
            remember(`${method} ${path}: ${response.status} ${text.slice(0, 120)}`);
        }

        return { ok: response.ok, status: response.status, data };
    }

    function remember(message) {
        if (problems.length < 5) {
            problems.push(message);
        }
    }

    function stats() {
        return { requests, serverErrors, problems };
    }

    return { call, stats, remember };
}
