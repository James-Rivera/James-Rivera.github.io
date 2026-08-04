const MAX_BODY_BYTES = 4_096;
const MAX_QUESTION_LENGTH = 500;

type ErrorCode =
  | 'METHOD_NOT_ALLOWED'
  | 'INVALID_CONTENT_TYPE'
  | 'INVALID_JSON'
  | 'INVALID_QUESTION'
  | 'BODY_TOO_LARGE'
  | 'LLM_NOT_CONFIGURED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly headers?: HeadersInit,
  ) {
    super(message);
  }
}

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');

  return Response.json(data, { ...init, headers });
}

async function readBoundedBody(request: Request): Promise<string> {
  if (!request.body) return '';

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let receivedBytes = 0;

  while (true) {
    const result = await reader.read();
    if (result.done) break;

    receivedBytes += result.value.byteLength;
    if (receivedBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new ApiError(413, 'BODY_TOO_LARGE', 'Request body is too large.');
    }

    chunks.push(decoder.decode(result.value, { stream: true }));
  }

  chunks.push(decoder.decode());
  return chunks.join('');
}

async function readQuestion(request: Request): Promise<string> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new ApiError(415, 'INVALID_CONTENT_TYPE', 'Content-Type must be application/json.');
  }

  const rawBody = await readBoundedBody(request);
  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must contain valid JSON.');
  }

  if (typeof body !== 'object' || body === null || !('question' in body)) {
    throw new ApiError(400, 'INVALID_QUESTION', 'A question is required.');
  }

  const question = body.question;
  if (typeof question !== 'string') {
    throw new ApiError(400, 'INVALID_QUESTION', 'Question must be text.');
  }

  const normalizedQuestion = question.trim();
  if (!normalizedQuestion || normalizedQuestion.length > MAX_QUESTION_LENGTH) {
    throw new ApiError(
      400,
      'INVALID_QUESTION',
      `Question must be between 1 and ${MAX_QUESTION_LENGTH} characters.`,
    );
  }

  return normalizedQuestion;
}

function errorResponse(error: ApiError, requestId: string): Response {
  return json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
      requestId,
    },
    { status: error.status, headers: error.headers },
  );
}

async function handleApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestId = crypto.randomUUID();

  try {
    if (url.pathname === '/api/health') {
      if (request.method !== 'GET') {
        throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Use GET for this endpoint.', {
          Allow: 'GET',
        });
      }

      return json({
        ok: true,
        service: 'james-rivera-portfolio-api',
        llm: 'not-configured',
        requestId,
      });
    }

    if (url.pathname === '/api/ask') {
      if (request.method !== 'POST') {
        throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Use POST for this endpoint.', {
          Allow: 'POST',
        });
      }

      await readQuestion(request);

      throw new ApiError(
        503,
        'LLM_NOT_CONFIGURED',
        'The Ask API is ready, but the homelab LLM is not connected yet.',
        { 'Retry-After': '60' },
      );
    }

    throw new ApiError(404, 'NOT_FOUND', 'API endpoint not found.');
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error, requestId);

    console.error(
      JSON.stringify({
        message: 'Unhandled API error',
        error: error instanceof Error ? error.message : String(error),
        method: request.method,
        path: url.pathname,
        requestId,
      }),
    );

    return errorResponse(
      new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.'),
      requestId,
    );
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'www.jamesrivera.dev') {
      url.hostname = 'jamesrivera.dev';
      return Response.redirect(url, 308);
    }

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
