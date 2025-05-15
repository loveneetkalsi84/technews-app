import puppeteer from "puppeteer";
import connectToDatabase from "@/app/lib/mongodb";
import { Product, Source, ScrapedProduct } from "@/app/models/schema";

/**
 * Scrape product data from configured e-commerce sources
 */
export async function scrapeProductData() {
  let browser;
  try {
    console.log("Starting product data scraping...");
    await connectToDatabase();
    
    // Get all active scraping sources from the database
    const sources = await Source.find({ type: "scrape", isActive: true });
    
    if (!sources.length) {
      console.log("No active scraping sources found");
      return { success: true, message: "No active scraping sources found" };
    }
    
    console.log(`Found ${sources.length} active scraping sources`);
    
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    let totalNewProducts = 0;
    let totalUpdatedProducts = 0;
    
    // Process each source
    for (const source of sources) {
      try {
        if (!source.scrapingConfig) {
          console.log(`Source "${source.name}" has no scraping configuration. Skipping.`);
          continue;
        }
        
        const config = source.scrapingConfig;
        console.log(`Processing source: ${source.name}`);
        
        // Get product URLs from the source
        const urlList = Array.isArray(config.productUrls) 
          ? config.productUrls 
          : typeof config.productListUrl === 'string' 
            ? [config.productListUrl] 
            : [];
        
        if (!urlList.length) {
          console.log(`No product URLs found for source ${source.name}`);
          continue;
        }
        
        // Process each product URL
        for (const url of urlList) {
          try {
            const page = await browser.newPage();
            
            // Set viewport size for consistent rendering
            await page.setViewport({ width: 1280, height: 800 });
            
            // Navigate to the URL
            console.log(`Navigating to ${url}`);
            const absoluteUrl = url.startsWith('http') ? url : `${source.url}${url}`;
            await page.goto(absoluteUrl, { waitUntil: 'networkidle2' });
            
            // Wait for the main content to load based on config
            if (config.waitForSelector) {
              await page.waitForSelector(config.waitForSelector, { timeout: 5000 }).catch(() => {});
            }
            
            // Scrape the product data
            const productData = await page.evaluate((cfg: any): Partial<ScrapedProduct> => {
              // Helper function to get text from a selector
              const getData = (selector: string) => {
                const element = document.querySelector(selector);
                return element ? element.textContent?.trim() : '';
              };
              
              // Get specs from a table or list
              const getSpecs = () => {
                const specs: Record<string, string> = {};
                if (cfg.specTableSelector) {
                  const rows = document.querySelectorAll(cfg.specTableSelector);
                  rows.forEach((row: any) => {
                    const keyElement = row.querySelector(cfg.specKeySelector || '');
                    const valueElement = row.querySelector(cfg.specValueSelector || '');
                    if (keyElement && valueElement) {
                      const key = keyElement.textContent?.trim();
                      const value = valueElement.textContent?.trim();
                      if (key && value) specs[key] = value;
                    }
                  });
                }
                return specs;
              };
              
              // Get features from a list
              const getFeatures = () => {
                const features: string[] = [];
                if (cfg.featureListSelector) {
                  const items = document.querySelectorAll(cfg.featureListSelector);
                  items.forEach((item: any) => {
                    const text = item.textContent?.trim();
                    if (text) features.push(text);
                  });
                }
                return features;
              };
              
              // Get rating information
              const getRating = () => {
                let ratingValue;
                let ratingCount;
                
                if (cfg.ratingValueSelector) {
                  const ratingElement = document.querySelector(cfg.ratingValueSelector);
                  if (ratingElement && ratingElement.textContent) {
                    const ratingText = ratingElement.textContent.trim();
                    // Try to extract a number from the text
                    const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
                    ratingValue = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
                  }
                }
                
                if (cfg.ratingCountSelector) {
                  const countElement = document.querySelector(cfg.ratingCountSelector);
                  if (countElement && countElement.textContent) {
                    const countText = countElement.textContent.trim();
                    // Try to extract a number from the text
                    const countMatch = countText.match(/(\d+)/);
                    ratingCount = countMatch ? parseInt(countMatch[1]) : undefined;
                  }
                }
                
                return { ratingValue, ratingCount };
              };
              
              // Get availability information
              const getAvailability = (): 'InStock' | 'OutOfStock' | 'Unknown' => {
                if (!cfg.availabilitySelector) return 'Unknown';
                
                const element = document.querySelector(cfg.availabilitySelector);
                if (!element) return 'Unknown';
                
                const text = element.textContent?.toLowerCase() || '';
                
                if (text.includes('in stock') || text.includes('available')) {
                  return 'InStock';
                } else if (text.includes('out of stock') || text.includes('unavailable') || text.includes('sold out')) {
                  return 'OutOfStock';
                }
                
                return 'Unknown';
              };
              
              // Get image URL
              const getImageUrl = () => {
                if (!cfg.imageSelector) return undefined;
                
                const imgElement = document.querySelector(cfg.imageSelector);
                return imgElement?.getAttribute('src') || undefined;
              };
              
              // Extract product data
              const name = getData(cfg.nameSelector || '');
              const brand = getData(cfg.brandSelector || '');
              const price = getData(cfg.priceSelector || '');
              const description = getData(cfg.descriptionSelector || '');
              const imageUrl = getImageUrl();
              const specs = getSpecs();
              const features = getFeatures();
              const { ratingValue, ratingCount } = getRating();
              const availability = getAvailability();
              
              // Try to determine currency from price string
              let currency = 'USD'; // Default
              if (price && price.includes('$')) currency = 'USD';
              else if (price && price.includes('€')) currency = 'EUR';
              else if (price && price.includes('£')) currency = 'GBP';
              else if (price && price.includes('¥')) currency = 'JPY';
              
              return {
                name,
                brand,
                price: price ? price.replace(/[^\d.,]/g, '') : undefined, // Remove currency symbols
                currency,
                description,
                imageUrl,
                specs,
                features,
                ratingValue,
                ratingCount,
                availability,
              };
            }, config);
            
            // Add source and URL information to the product data
            const finalProductData = {
              ...productData,
              sourceId: (source._id as any).toString(),
              productUrl: absoluteUrl
            };
            
            // Check if product already exists by URL
            const existingProduct = await Product.findOne({ sourceUrl: absoluteUrl });
            
            if (existingProduct) {
              // Update the existing product
              await Product.updateOne(
                { _id: existingProduct._id },
                { 
                  $set: {
                    ...finalProductData,
                    updatedAt: new Date()
                  }
                }
              );
              
              totalUpdatedProducts++;
              console.log(`Updated existing product: ${finalProductData.name}`);
            } else {
              // Create a new product
              await Product.create({
                ...finalProductData,
                categories: Array.isArray(config.categories) ? config.categories : [],
                sourceUrl: absoluteUrl
              });
              
              totalNewProducts++;
              console.log(`Added new product: ${finalProductData.name}`);
            }
            
            // Close the page
            await page.close();
            
          } catch (productErr) {
            console.error(`Error processing product ${url}:`, productErr);
          }
        }
        
        // Update the lastFetched date on the source
        await Source.updateOne(
          { _id: source._id },
          { $set: { lastFetched: new Date() } }
        );
        
      } catch (sourceErr) {
        console.error(`Error processing source:`, sourceErr);
        
        // Update the source with error information if possible
        if (source && source._id) {
          try {
            await Source.updateOne(
              { _id: source._id },
              { 
                $set: { 
                  lastFetched: new Date(),
                  lastError: `${sourceErr}`,
                  lastErrorDate: new Date()
                } 
              }
            );
          } catch (updateErr) {
            console.error("Error updating source with error information:", updateErr);
          }
        }
      }
    }
    
    return {
      success: true,
      message: `Product data scraping completed. Added ${totalNewProducts} new products and updated ${totalUpdatedProducts} existing products.`
    };
    
  } catch (err) {
    console.error("Failed to scrape product data:", err);
    return { success: false, message: `Failed to scrape product data: ${err}` };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
