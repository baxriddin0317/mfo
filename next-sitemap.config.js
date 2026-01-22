module.exports = {
  siteUrl: 'https://mfoxa.com.ua',
  generateRobotsTxt: true,
  // Exclude sitemap.xml generation since we have a custom route handler
  exclude: ['/sitemap.xml'],
  // Don't generate sitemap files - we use custom route handler
  generateIndexSitemap: false,
};