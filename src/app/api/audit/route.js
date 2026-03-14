import { runAudit } from '@/lib/audit-engine';

export async function POST(req) {
  try {
    const { html, level = 'AA', categories = null, baseUrl = null } = await req.json();

    if (!html && !baseUrl) {
      return Response.json(
        { error: 'HTML content or baseUrl is required' },
        { status: 400 }
      );
    }

    const results = await runAudit(html, { level, categories, baseUrl });

    return Response.json(results);
  } catch (error) {
    console.error('Audit failed:', error);
    return Response.json(
      { error: 'Audit failed', message: error.message },
      { status: 500 }
    );
  }
}
