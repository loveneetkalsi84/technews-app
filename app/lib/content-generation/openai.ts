import OpenAI from 'openai';

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentGenerationParams {
  topic: string;
  type: 'article' | 'review' | 'comparison';
  keywords: string[];
  tone?: 'informative' | 'enthusiastic' | 'critical' | 'neutral';
  wordCount?: number;
  includeHeadings?: boolean;
}

/**
 * Generates article content using OpenAI API
 */
export async function generateArticleContent({
  topic,
  type,
  keywords,
  tone = 'informative',
  wordCount = 800,
  includeHeadings = true,
}: ContentGenerationParams) {
  // Base prompt structure depending on content type
  let basePrompt = '';
  
  switch (type) {
    case 'article':
      basePrompt = `Write a detailed tech news article about ${topic}. The article should be informative, well-structured, and engaging.`;
      break;
    case 'review':
      basePrompt = `Write a comprehensive review of ${topic}. The review should analyze features, performance, pros and cons, and provide a final verdict.`;
      break;
    case 'comparison':
      basePrompt = `Write a detailed comparison of ${topic}. The comparison should highlight key similarities, differences, and provide recommendations for different use cases.`;
      break;
  }

  // Add structure and SEO requirements to the prompt
  const structurePrompt = includeHeadings 
    ? 'Include 3-5 descriptive subheadings to organize the content.' 
    : '';
  
  const seoPrompt = `Naturally incorporate these keywords: ${keywords.join(', ')}.`;
  
  const tonePrompt = `The tone should be ${tone}.`;
  
  const wordCountPrompt = `The content should be approximately ${wordCount} words.`;
  
  const fullPrompt = `${basePrompt} ${structurePrompt} ${seoPrompt} ${tonePrompt} ${wordCountPrompt}`;

  // Call OpenAI API to generate content
  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: fullPrompt,
      max_tokens: Math.min(wordCount * 2, 4000), // Approximate token count
      temperature: 0.7,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    throw new Error('Failed to generate content. Please try again later.');
  }
}

/**
 * Generates SEO metadata for an article
 */
export async function generateSEOMetadata(
  title: string,
  content: string
) {
  try {
    const prompt = `
      For the article titled "${title}", analyze the following content and generate:
      1. A compelling meta description under 160 characters
      2. 5-7 SEO-friendly keywords relevant to the content
      3. An SEO score from 0-100 based on keyword density, relevance, and content quality

      Content: ${content.substring(0, 2000)}...
      
      Format the response exactly as follows:
      Meta Description: [your meta description]
      Keywords: [comma-separated keywords]
      SEO Score: [number]
    `;

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      max_tokens: 500,
      temperature: 0.5,
    });

    const result = response.choices[0].text.trim();
    const metaDescription = result.match(/Meta Description: (.*)/i)?.[1] || '';
    const keywordsText = result.match(/Keywords: (.*)/i)?.[1] || '';
    const keywords = keywordsText.split(',').map(k => k.trim());
    const seoScoreText = result.match(/SEO Score: (\d+)/i)?.[1] || '0';
    const seoScore = parseInt(seoScoreText, 10);

    return {
      metaDescription,
      keywords,
      seoScore: isNaN(seoScore) ? 0 : seoScore
    };
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    return {
      metaDescription: '',
      keywords: [],
      seoScore: 0
    };
  }
}

/**
 * Checks content for potential plagiarism using AI
 */
export async function checkForPlagiarism(content: string) {
  try {
    const prompt = `
      Analyze this text and determine if it appears to be original content or if it might be plagiarized:
      
      ${content.substring(0, 2000)}...
      
      Rate the originality from 0 to 100, where:
      - 0-30: Likely plagiarized from common sources
      - 31-70: Mixed original and common content
      - 71-100: Highly original content
      
      Just return a number representing the originality score.
    `;

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      max_tokens: 100,
      temperature: 0.2,
    });

    const scoreText = response.choices[0].text.trim();
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0', 10);

    return {
      originalityScore: isNaN(score) ? 0 : Math.min(100, Math.max(0, score)),
      isPlagiarismSuspected: score < 50
    };
  } catch (error) {
    console.error('Error checking for plagiarism:', error);
    return {
      originalityScore: 0,
      isPlagiarismSuspected: true
    };
  }
}

export default openai;
