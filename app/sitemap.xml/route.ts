import { NextResponse } from 'next/server';
import { getMFOs } from '@/app/services/mfosService';

const staticPages = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: 'contacts', priority: 0.9, changefreq: 'weekly' },
  { path: 'reviews', priority: 0.7, changefreq: 'monthly' },
  { path: 'loan', priority: 0.8, changefreq: 'weekly' },
  { path: 'about', priority: 0.6, changefreq: 'monthly' },
  { path: 'mfo', priority: 0.85, changefreq: 'weekly' },
];

function generateUrl(loc: string, lastmod: string, priority: number, changefreq: string) {
  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority.toFixed(1)}</priority>
    </url>
  `;
}

export async function GET() {
  const baseUrl = 'https://mfoxa.com.ua';
  const today = new Date().toISOString().split('T')[0];
  
  // Generate static pages for both languages
  const staticUrls: string[] = [];
  
  staticPages.forEach((page) => {
    // Ukrainian version (no prefix)
    staticUrls.push(
      generateUrl(
        `${baseUrl}${page.path}`,
        today,
        page.priority,
        page.changefreq
      )
    );
    
    // Russian version (with /ru prefix)
    staticUrls.push(
      generateUrl(
        `${baseUrl}/ru/${page.path}`,
        today,
        page.priority,
        page.changefreq
      )
    );
  });

  // Fetch MFO companies dynamically
  const mfoUrls: string[] = [];
  try {
    const mfos = await getMFOs({ lang: 'uk', per_page: 1000 });
    if (Array.isArray(mfos)) {
      mfos.forEach((mfo) => {
        // Check if MFO has required properties and is active (if property exists)
        if (mfo.slug && (mfo.is_active !== false)) {
          const lastmod = mfo.updated_at 
            ? new Date(mfo.updated_at).toISOString().split('T')[0]
            : today;
          
          // Ukrainian version (no prefix)
          mfoUrls.push(
            generateUrl(
              `${baseUrl}/mfo/${mfo.slug}`,
              lastmod,
              0.8,
              'weekly'
            )
          );
          
          // Russian version (with /ru prefix)
          mfoUrls.push(
            generateUrl(
              `${baseUrl}/ru/mfo/${mfo.slug}`,
              lastmod,
              0.8,
              'weekly'
            )
          );
        }
      });
    }
  } catch (error) {
    console.error('Error fetching MFOs for sitemap:', error);
    // Continue without MFO URLs if API fails
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls.join('')}
${mfoUrls.join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
    },
  });
}