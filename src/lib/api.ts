/**
 * The site's only HTTP client, used exclusively by `manage` mode.
 *
 * The paying pages deliberately talk to nobody: the app mints the Razorpay
 * object first and hands over an unguessable id, so `/pay` needs no credentials
 * at all. Cancelling has no such capability — `POST /subscription/cancel`
 * requires a bearer token — so this is the one place the page holds one.
 *
 * Both `token` and `baseUrl` come from the injected handoff. `baseUrl` is passed
 * rather than baked in because the app points at a dev tunnel during testing;
 * a hardcoded production URL would send cancels to the wrong backend and look
 * like nothing happened at all.
 *
 * The backend sets `Access-Control-Allow-Origin: *` with no credentials, so a
 * Bearer header works cross-origin unchanged — no cookies, no preflight config.
 */

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  message: string | null;
  statusCode: number;
  data?: T;
  error?: string;
};

export type MeSubscription = {
  _id: string;
  status: string;
  isFree: boolean;
  isCancelled?: boolean;
  endDate?: string;
  razorpaySubscriptionId?: string;
  grantedVia?: 'purchase' | 'free' | 'referral';
  subscriptionId?: { name?: string; slug?: string; price?: number };
};

export type MeResponse = {
  user?: { fullName?: string; email?: string };
  subscription: MeSubscription | null;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function join(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

async function request<T>(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(join(baseUrl, path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    // Distinguished from an HTTP error on purpose: inside a WebView this is
    // usually the phone losing connectivity, not the backend failing.
    throw new ApiError('No connection. Check your network and try again.', 0);
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    /* non-JSON error page — fall through to the status-based message */
  }

  if (!response.ok || body?.isSuccess === false) {
    throw new ApiError(
      body?.message || body?.error || `Request failed (${response.status})`,
      response.status
    );
  }

  return body?.data as T;
}

export const getMe = (baseUrl: string, token: string) =>
  request<MeResponse>(baseUrl, token, '/me');

/**
 * Asks the backend to cancel a subscription.
 *
 * A 200 means *requested*, not *cancelled* — for a Razorpay-backed plan the
 * controller only calls Razorpay and writes nothing locally; the row flips when
 * the `subscription.cancelled` webhook lands. Free and referral plans are the
 * exception and do flip synchronously. Callers must not claim it is done.
 */
export const cancelSubscription = (baseUrl: string, token: string, userSubscriptionId: string) =>
  request<unknown>(baseUrl, token, '/subscription/cancel', {
    method: 'POST',
    body: JSON.stringify({ userSubscriptionId }),
  });
