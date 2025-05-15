import connectToDatabase from "@/app/lib/mongodb";
import { Article, Source } from "@/app/models/schema";
import { generateSlug } from "@/app/utils/helpers";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for content generation
type ContentType = "article" | "review" | "news";

interface ContentRequest {
  title?: string;
  topic: string;
  type: ContentType;
  keywords?: string[];
  targetLength?: number;
  productDetails?: {
    name: string;
    brand: string;
    category: string;
    features: string[];
    specs: Record<string, string>;
  };
}

/**
 * Generate content using OpenAI
 */
export async function generateContent(req: ContentRequest) {
  try {
    // Validate the OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Generate a title if not provided
    let title = req.title;
    if (!title) {
      title = await generateTitle(req.topic, req.type);
    }
    
    // Generate a slug for the article
    const slug = await generateSlug(title);
    
    // Set up the content generation prompt based on content type
    let prompt = "";
    let systemPrompt = "";
    
    // Default target length if not specified
    const targetLength = req.targetLength || 1000;
    
    if (req.type === "review") {
      if (!req.productDetails) {
        throw new Error("Product details are required for reviews");
      }
      
      systemPrompt = `You are an expert technology reviewer who writes detailed, balanced, and informative product reviews. 
      Always maintain a neutral and professional tone. Include both pros and cons, and always conclude with a verdict.
      Format your review with proper HTML headings, paragraphs, and lists.`;
      
      prompt = `Write a comprehensive review of the ${req.productDetails.name} by ${req.productDetails.brand}, a ${req.productDetails.category} product.
      
      Product features include: ${req.productDetails.features.join(", ")}
      
      Key specifications: 
      ${Object.entries(req.productDetails.specs)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")}
      
      Target audience: Tech enthusiasts and consumers looking for detailed product information.
      
      Include the following sections:
      - Introduction/Overview
      - Design and Build Quality
      - Features and Performance
      - User Experience
      - Pros and Cons
      - Comparison to Competitors (if applicable)
      - Verdict/Conclusion with a rating out of 10
      
      The review should be around ${targetLength} words, be informative, balanced, and provide clear recommendations.
      Include specific details about the product and avoid generic statements.`;
      
    } else if (req.type === "news") {
      systemPrompt = `You are a technology news writer who creates clear, factual, and engaging news articles. 
      Follow journalistic best practices with inverted pyramid structure. Focus on facts, not speculation.
      Format your article with proper HTML headings, paragraphs, and quotes if appropriate.`;
      
      prompt = `Write a technology news article on the topic of "${req.topic}".
      
      Keywords to include: ${(req.keywords || []).join(", ")}
      
      The article should:
      - Have a compelling headline (already provided: "${title}")
      - Start with a strong lead paragraph that summarizes the news
      - Include relevant background information
      - Be around ${targetLength} words
      - Maintain a journalistic and informative tone
      - Be factual and objective
      - End with implications or what might happen next
      
      Please format the article with proper HTML structure.`;
      
    } else {
      // Regular article
      systemPrompt = `You are a technology writer who creates insightful, educational, and engaging articles. 
      Your writing is clear, detailed, and provides valuable information to readers.
      Format your article with proper HTML headings, paragraphs, and lists where appropriate.`;
      
      prompt = `Write an informative article on the topic of "${req.topic}".
      
      Keywords to include: ${(req.keywords || []).join(", ")}
      
      The article should:
      - Have a compelling headline (already provided: "${title}")
      - Include an engaging introduction
      - Be divided into logical sections with subheadings
      - Include practical information, examples, or tips when relevant
      - Be around ${targetLength} words
      - Have a clear conclusion
      
      Please format the article with proper HTML structure.`;
    }
    
    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "gpt-4-turbo", // Use the best available model
      max_tokens: 2500,
      temperature: 0.7,
    });
    
    // Extract the generated content
    const generatedContent = completion.choices[0].message.content || "";
    
    // Extract a suitable excerpt from the content
    let excerpt = generatedContent.replace(/<[^>]*>/g, " "); // Remove HTML tags
    excerpt = excerpt.substring(0, 300) + (excerpt.length > 300 ? "..." : "");
    
    // Create the article object
    const articleData = {
      title,
      slug,
      content: generatedContent,
      excerpt,
      source: null, // AI-generated content has no source
      publishedAt: new Date(),
      author: {
        name: "AI Editor", // Indicate AI-generated content
      },
      tags: req.keywords || [],
      isPublished: false, // Default to draft mode for review
      isAIGenerated: true,
      generationPrompt: prompt,
    };
    
    // Save to database
    const article = await Article.create(articleData);
    
    return {
      success: true,
      articleId: article._id,
      title,
      slug,
      excerpt,
      message: "Content generated successfully",
    };
    
  } catch (error: any) {
    console.error("Content generation failed:", error);
    
    return {
      success: false,
      message: `Content generation failed: ${error.message}`,
    };
  }
}

/**
 * Generate a title for an article using OpenAI
 */
async function generateTitle(topic: string, type: ContentType): Promise<string> {
  try {
    const systemPrompt = `You are a headline writer for a technology publication.
    Create catchy but informative headlines that accurately represent the content.`;
    
    let prompt = `Generate a compelling headline for a technology ${type} about "${topic}".
    The headline should:
    - Be attention-grabbing but not clickbait
    - Clearly indicate what the content is about
    - Be concise (around 8-10 words)
    - Include relevant keywords for SEO
    
    Return only the headline text, nothing else.`;
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "gpt-4-turbo",
      max_tokens: 50,
      temperature: 0.7,
    });
    
    let title = completion.choices[0].message.content || "";
    
    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, "");
    
    return title;
  } catch (error: any) {
    console.error("Title generation failed:", error);
    // Fallback to a simple title
    return `${type.charAt(0).toUpperCase() + type.slice(1)} about ${topic}`;
  }
}
