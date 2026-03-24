// Cloudflare Worker CORS Proxy dengan header Baozi
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Hanya izinkan metode GET dan OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    })
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // Header khusus Baozi dari aplikasi Android
  const baoziHeaders = {
    'Referer': 'https://appgb.baozimh.com/',
    'app-id': 'cn.sts.xiaoyun.ordermeals',
    'device-code': '6ca052067aa9833084daaa6ffeba0913',
    'device-id': 'RKQ1.201217.002',
    'user-agent': 'baozimh_android/1.0.31/gb/adset',
    'app-version': '1.0.31',
    'Accept-Encoding': 'gzip',
    'Connection': 'Keep-Alive'
  }

  // Tambahkan header tambahan jika diperlukan
  const headers = new Headers(baoziHeaders)

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
    })

    // Buat response header baru dengan CORS
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', '*')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })
  } catch (err) {
    return new Response(`Proxy error: ${err.message}`, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}
