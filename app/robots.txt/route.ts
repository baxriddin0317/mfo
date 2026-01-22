import { NextResponse } from 'next/server';

export async function GET() {
  // Standard robots.txt format - allows all crawlers to index all pages
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://mfoxa.com.ua/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}

