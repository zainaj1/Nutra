type GetToken = (options?: { skipCache?: boolean }) => Promise<string | null>;

export class SessionExpiredError extends Error {
    constructor() {
        super('Your session has expired. Please sign in again.');
        this.name = 'SessionExpiredError';
    }
}

export async function authenticatedFetch(
    getToken: GetToken,
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    // Long recipe operations can outlive a cached token. Mint one for each request,
    // including the GET that follows an accept/reject operation.
    const token = await getToken({ skipCache: true });
    if (!token) throw new SessionExpiredError();

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    // Do not automatically replay mutations: the server may already have applied them.
    return fetch(url, { ...options, headers });
}
