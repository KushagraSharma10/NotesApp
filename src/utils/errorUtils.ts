export function getReadableErrorMessage(
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.',
) {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const errorMessage = error.message || '';

  if (
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('Failed to fetch')
  ) {
    return 'Unable to connect to the notes server. Please make sure the server is running.';
  }

  if (errorMessage.includes('status 400')) {
    return 'Invalid request. Please check the entered details.';
  }

  if (errorMessage.includes('status 401')) {
    return 'Your session is not valid. Please sign in again.';
  }

  if (errorMessage.includes('status 404')) {
    return 'Requested note was not found.';
  }

  if (errorMessage.includes('status 500')) {
    return 'Something went wrong on the server. Please try again.';
  }

  return errorMessage || fallbackMessage;
}

export function logError(error: unknown, source: string) {
  if (__DEV__) {
    console.error(`[${source}]`, error);
  }
}