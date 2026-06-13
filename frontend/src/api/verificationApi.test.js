import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_GOVERNMENT_WARNING } from '../constants/defaultWarningText';

const EXPECTED_FIELDS = {
  brandName: 'OLD TOM DISTILLERY',
  classType: 'Kentucky Straight Bourbon Whiskey',
  alcoholContent: '45% Alc./Vol. (90 Proof)',
  netContents: '750 mL',
  bottlerProducer: 'Old Tom Distillery, Louisville, KY',
  countryOfOrigin: 'USA',
  governmentWarning: 'Client warning text',
};

describe('verification API client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('checks backend health against the default local API URL', async () => {
    const fetchMock = mockFetch(jsonResponse({ status: 'ok' }));
    const { checkHealth } = await loadApiClient();

    await expect(checkHealth()).resolves.toEqual({ status: 'ok' });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health');
  });

  it('uses the configured API base URL and POST method for warmup', async () => {
    const fetchMock = mockFetch(jsonResponse({ status: 'ok' }));
    const { warmVerificationBackend } = await loadApiClient('https://api.example.test');

    await expect(warmVerificationBackend()).resolves.toEqual({ status: 'ok' });

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/warmup', {
      method: 'POST',
    });
  });

  it('sends the selected file and expected fields as backend-compatible FormData', async () => {
    const fetchMock = mockFetch(jsonResponse({ overall_status: 'pass' }));
    const { verifySingleLabel } = await loadApiClient();
    const file = new File([new Uint8Array([1, 2, 3])], 'label.png', { type: 'image/png' });

    await expect(verifySingleLabel(file, EXPECTED_FIELDS)).resolves.toEqual({ overall_status: 'pass' });

    const [url, options] = fetchMock.mock.calls[0];
    const body = options.body;

    expect(url).toBe('http://localhost:8000/verify');
    expect(options.method).toBe('POST');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('file')).toBe(file);
    expect(body.get('brand_name')).toBe(EXPECTED_FIELDS.brandName);
    expect(body.get('class_type')).toBe(EXPECTED_FIELDS.classType);
    expect(body.get('alcohol_content')).toBe(EXPECTED_FIELDS.alcoholContent);
    expect(body.get('net_contents')).toBe(EXPECTED_FIELDS.netContents);
    expect(body.get('bottler_producer')).toBe(EXPECTED_FIELDS.bottlerProducer);
    expect(body.get('country_of_origin')).toBe(EXPECTED_FIELDS.countryOfOrigin);
    expect(body.get('government_warning')).toBe(EXPECTED_FIELDS.governmentWarning);
  });

  it('falls back to the default government warning when no warning text is provided', async () => {
    const fetchMock = mockFetch(jsonResponse({ overall_status: 'pass' }));
    const { verifySingleLabel } = await loadApiClient();
    const file = new File(['image'], 'label.png', { type: 'image/png' });

    await verifySingleLabel(file, { ...EXPECTED_FIELDS, governmentWarning: '' });

    const formData = fetchMock.mock.calls[0][1].body;
    expect(formData.get('government_warning')).toBe(DEFAULT_GOVERNMENT_WARNING);
  });

  it('throws backend detail text for unsuccessful JSON responses', async () => {
    mockFetch(jsonResponse({ detail: 'Unsupported file extension.' }, { ok: false }));
    const { verifySingleLabel } = await loadApiClient();

    await expect(verifySingleLabel(new File(['bad'], 'bad.svg'), EXPECTED_FIELDS)).rejects.toThrow(
      'Unsupported file extension.',
    );
  });

  it('throws a safe fallback message for unsuccessful non-JSON responses', async () => {
    mockFetch(nonJsonResponse({ ok: false }));
    const { checkHealth } = await loadApiClient();

    await expect(checkHealth()).rejects.toThrow('The verification service returned an error.');
  });

  it('propagates network failures for UI hooks to translate', async () => {
    const networkError = new Error('Failed to fetch');
    mockFetch(Promise.reject(networkError));
    const { checkHealth } = await loadApiClient();

    await expect(checkHealth()).rejects.toThrow('Failed to fetch');
  });
});

async function loadApiClient(apiBaseUrl = '') {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', apiBaseUrl);

  return import('./verificationApi');
}

function mockFetch(response) {
  const fetchMock = vi.fn(() => Promise.resolve(response));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(body, { ok = true } = {}) {
  return {
    ok,
    json: vi.fn(() => Promise.resolve(body)),
  };
}

function nonJsonResponse({ ok = true } = {}) {
  return {
    ok,
    json: vi.fn(() => Promise.reject(new Error('Response body is not JSON.'))),
  };
}
