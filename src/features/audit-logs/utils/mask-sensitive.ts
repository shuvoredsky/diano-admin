const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /cookie/i,
  /authorization/i,
  /cvv/i,
  /credential/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
];

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const record = data as Record<string, unknown>;
  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (isSensitiveKey(key)) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
