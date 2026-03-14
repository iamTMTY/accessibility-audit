export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return Response.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(parsedUrl.href, {
      headers: {
        'User-Agent': 'Accessibility-Copilot/1.0 (Web Accessibility Auditor)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return Response.json(
        { error: 'URL does not return HTML content' },
        { status: 400 }
      );
    }

    const html = await response.text();

    return Response.json({ 
      html,
      url: parsedUrl.href,
      contentLength: html.length
    });
  } catch (error) {
    console.error('Fetch URL failed:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch URL' },
      { status: 500 }
    );
  }
}
