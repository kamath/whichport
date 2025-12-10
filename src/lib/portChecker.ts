export interface CheckResult {
  status: 'active' | 'inactive'
  pageTitle?: string
  responseTime: number
  error?: string
  httpStatus?: number
}

function buildUrl(host: string, port: number, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `http://${host}:${port}${normalizedPath}`
}

async function extractPageTitle(response: Response): Promise<string | undefined> {
  try {
    const text = await response.text()
    // Try to find <title> tag in HTML
    const match = text.match(/<title[^>]*>([^<]+)<\/title>/i)
    return match?.[1]?.trim()
  } catch {
    return undefined
  }
}

export async function checkPort(
  host: string,
  port: number,
  path: string = '/',
  timeout: number = 5000
): Promise<CheckResult> {
  const url = buildUrl(host, port, path)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const startTime = performance.now()

  try {
    // First attempt: normal fetch (works for CORS-enabled endpoints)
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
    })

    const responseTime = performance.now() - startTime
    clearTimeout(timeoutId)

    // Try to extract page title from HTML response
    const pageTitle = await extractPageTitle(response)

    return {
      status: 'active',
      pageTitle,
      responseTime,
      httpStatus: response.status,
    }
  } catch {
    // CORS failed or network error, try no-cors mode to detect if port responds
    try {
      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
      })

      const responseTime = performance.now() - startTime
      clearTimeout(timeoutId)

      // Opaque response - can't read content but port is responding
      return {
        status: 'active',
        responseTime,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'inactive',
            responseTime: timeout,
            error: 'Request timed out',
          }
        }

        return {
          status: 'inactive',
          responseTime: performance.now() - startTime,
          error: error.message,
        }
      }

      return {
        status: 'inactive',
        responseTime: performance.now() - startTime,
        error: 'Unknown error',
      }
    }
  }
}
