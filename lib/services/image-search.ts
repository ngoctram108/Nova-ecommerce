export interface ImageSearchResult {
  imageUrl: string;
  imageAlt: string;
  imageSourceUrl: string;
}

export async function validateAndExtractImage(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const ext = urlObj.pathname.split('.').pop()?.toLowerCase();
    
    if (!url.startsWith('http')) return null;

    let res = await fetch(url, { 
      method: 'GET', 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    });

    if (!res.ok) return null;

    const ct = res.headers.get('content-type') || '';
    
    // If it's directly an image
    if (ct.startsWith('image/')) {
      return url;
    }

    // If it's HTML, try to parse og:image
    if (ct.includes('text/html')) {
      const text = await res.text();
      const ogMatch = text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) || 
                      text.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i) ||
                      text.match(/<meta[^>]*itemprop="image"[^>]*content="([^"]+)"/i) ||
                      text.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i) ||
                      text.match(/<meta[^>]*content="([^"]+)"[^>]*name="twitter:image"/i) ||
                      text.match(/<link[^>]*rel="image_src"[^>]*href="([^"]+)"/i);
                      
      if (ogMatch && ogMatch[1]) {
        let extractedUrl = ogMatch[1];
        if (extractedUrl.startsWith('/')) {
           const origin = new URL(url).origin;
           extractedUrl = `${origin}${extractedUrl}`;
        }
        
        // Validate the extracted image URL
        const imgRes = await fetch(extractedUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (imgRes.ok && (imgRes.headers.get('content-type') || '').startsWith('image/')) {
          return extractedUrl;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function searchProductImage(query: string): Promise<ImageSearchResult | null> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  if (unsplashKey) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=squarish`,
        {
          headers: {
            Authorization: `Client-ID ${unsplashKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          for (const photo of data.results) {
            const imgUrl = photo.urls.regular;
            const validUrl = await validateAndExtractImage(imgUrl);
            if (validUrl) {
              return {
                imageUrl: validUrl,
                imageAlt: photo.alt_description || query,
                imageSourceUrl: photo.links.html,
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch from Unsplash API:', error);
    }
  }

  // Fallback 1: Wikipedia API
  try {
    const wikiResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        query
      )}&gsrlimit=3&prop=pageimages&pithumbsize=800&format=json&origin=*`
    );
    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json();
      const pages = wikiData.query?.pages;
      if (pages) {
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          if (page.thumbnail && page.thumbnail.source) {
            const imgUrl = page.thumbnail.source;
            const validUrl = await validateAndExtractImage(imgUrl);
            if (validUrl) {
              return {
                imageUrl: validUrl,
                imageAlt: page.title || query,
                imageSourceUrl: `https://en.wikipedia.org/?curid=${page.pageid}`,
              };
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch from Wikipedia API:', error);
  }

  return null;
}
