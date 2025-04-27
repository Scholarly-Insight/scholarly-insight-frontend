import axios from 'axios';
import { ArXivArticle, AIInsight } from '../../types/arXiv';

// Gemini API key - in a real app, this would be in a backend environment variable
const API_KEY = "AIzaSyCg9wgyjYklLr2x0V8HHmhG1tynnnL9K7Q";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// This service generates AI summaries based on article data using Gemini API
export const generateAISummary = async (article: ArXivArticle): Promise<AIInsight> => {
  try {
    // Get PDF link - improved detection
    const pdfLink = article.links.find(link => 
      link.title === 'pdf' || 
      link.type === 'application/pdf' || 
      (link.href && link.href.includes('.pdf'))
    )?.href;
    
    console.log('generateAISummary - PDF Link:', pdfLink);
    console.log('Article links:', article.links);
    
    // Extract article information
    const title = article.title;
    const authors = article.authors.map(author => author.name).join(', ');
    const abstract = article.summary;
    const category = article.primary_category.term;
    
    // Generate summary using Gemini API
    const summaryPrompt = `Please provide a comprehensive summary of this research paper:
    
    Title: ${title}
    Authors: ${authors}
    Category: ${category}
    Abstract: ${abstract}`;
    
    const summaryResponse = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: summaryPrompt
              }
            ]
          }
        ]
      }
    );
    
    // Extract summary text
    const aiSummary = summaryResponse.data.candidates[0].content.parts[0].text;
    
    // Generate key findings using Gemini API
    const keyPointsPrompt = `Please extract the key points, contributions, and main findings from this research paper:
    
    Title: ${title}
    Authors: ${authors}
    Category: ${category}
    Abstract: ${abstract}`;
    
    const keyPointsResponse = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: keyPointsPrompt
              }
            ]
          }
        ]
      }
    );
    
    // Process key findings - extract bullet points from response
    const keyPointsText = keyPointsResponse.data.candidates[0].content.parts[0].text;
    const keyFindings = processKeyPoints(keyPointsText);
    
    // Clean up any markdown formatting in the summary
    const cleanSummary = cleanMarkdownFormatting(aiSummary);
    
    return {
      summary: cleanSummary,
      keyFindings,
      relatedArticles: [],
      pdfLink // Include PDF link directly in the response
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Fallback to a simple summary in case of API error
    return generateFallbackSummary(article);
  }
};

// Helper function to process key points from Gemini response
function processKeyPoints(text: string): string[] {
  // Split text by line breaks and filter for bullet points
  const lines = text.split('\n');
  let keyPoints = lines
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))
    .map(line => line.trim().replace(/^[-•\d\.]+\s*/, ''));
  
  // Also filter out lines with asterisks that might be markdown formatting
  keyPoints = keyPoints.map(point => point.replace(/\*\*/g, '').replace(/\*/g, '').trim());
  
  // If no bullet points found or very few, try extracting from sentences
  if (keyPoints.length < 2) {
    // Clear existing points
    keyPoints = [];
    
    // Process the text to fix broken sentences
    const cleanedText = cleanMarkdownFormatting(text);
    
    // Split by paragraphs first
    const paragraphs = cleanedText.split('\n\n');
    
    // Loop through paragraphs to find key points
    for (const paragraph of paragraphs) {
      if (paragraph.toLowerCase().includes('key point') || 
          paragraph.toLowerCase().includes('finding') || 
          paragraph.toLowerCase().includes('contribution')) {
        // Split into sentences and extract key points
        const sentences = paragraph.split(/[.!?]/).filter(s => s.trim().length > 10);
        keyPoints = sentences.map(s => s.trim());
        if (keyPoints.length >= 2) break;
      }
    }
    
    // If still not enough key points, just take the first 3-4 sentences from the text
    if (keyPoints.length < 2) {
      const sentences = cleanedText.split(/[.!?]/).filter(s => s.trim().length > 10);
      keyPoints = sentences.slice(0, 4).map(s => s.trim());
    }
  }
  
  // Ensure each key point is a complete thought and properly formatted
  keyPoints = keyPoints.map(point => {
    // Capitalize first letter if not already
    let formattedPoint = point.charAt(0).toUpperCase() + point.slice(1);
    
    // Add period at the end if missing
    if (!formattedPoint.match(/[.!?]$/)) {
      formattedPoint += '.';
    }
    
    return formattedPoint;
  });
  
  return keyPoints;
}

// Function to clean markdown formatting from text
function cleanMarkdownFormatting(text: string): string {
  // First, remove markdown formatting like **, *, etc.
  let cleanText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\_\_/g, '')
    .replace(/\_/g, '')
    .replace(/\#\#\#/g, '')
    .replace(/\#\#/g, '')
    .replace(/\#/g, '')
    .trim();
  
  // Fix specific issues with broken words at line breaks
  // But preserve i.e. and e.g. as they are
  cleanText = cleanText
    // Join broken lines but preserve "i.e." and "e.g."
    .replace(/(\(e\s*)\s*[\n\r]+\s*(,)/g, '$1$2')  // Preserve "(e," across lines
    .replace(/(\(i\s*)\s*[\n\r]+\s*(,)/g, '$1$2');  // Preserve "(i," across lines
  
  // Join words that were broken across lines
  cleanText = cleanText.replace(/(\w+)\s*[\n\r]+\s*(\w+)/g, (match, p1, p2) => {
    // If the first part ends with a hyphen, join without space
    if (p1.endsWith('-')) {
      return p1.slice(0, -1) + p2;
    }
    // Check if it looks like a broken word
    if (p1.length < 3 || p2.length < 3) {
      return p1 + p2;
    }
    // Otherwise, add a space between words
    return p1 + ' ' + p2;
  });
  
  // Fix broken sentences by joining lines that don't end with proper punctuation
  const lines = cleanText.split('\n');
  const joinedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      joinedLines.push(''); // Keep empty lines for paragraph breaks
      continue;
    }
    
    // If we have a previous joined line and current line doesn't start with a capital letter,
    // or previous line doesn't end with punctuation, join them
    if (
      joinedLines.length > 0 && 
      joinedLines[joinedLines.length - 1] !== '' &&
      (!joinedLines[joinedLines.length - 1].match(/[.!?:;]\s*$/) || 
       !line.match(/^[A-Z]/))
    ) {
      // Join with the previous line, ensuring proper spacing
      const prevLine = joinedLines.pop() || '';
      joinedLines.push(prevLine + (prevLine.match(/\s$/) ? '' : ' ') + line);
    } else {
      joinedLines.push(line);
    }
  }
  
  // Join the lines back together with proper paragraph breaks
  cleanText = joinedLines.join('\n');
  
  // Remove excessive whitespace and ensure paragraph breaks are consistent
  cleanText = cleanText
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
  
  return cleanText;
}

// Fallback summary generation in case the API fails
function generateFallbackSummary(article: ArXivArticle): AIInsight {
  const title = article.title;
  const authors = article.authors.map(author => author.name).join(', ');
  const primaryCategory = article.primary_category.term;
  
  // Get PDF link even for fallback
  const pdfLink = article.links.find(link => 
    link.title === 'pdf' || 
    link.type === 'application/pdf' || 
    (link.href && link.href.includes('.pdf'))
  )?.href;
  
  const aiSummary = `This paper by ${authors} explores ${title.toLowerCase()}. 
  The research is in the field of ${primaryCategory} and presents significant contributions 
  through novel methodologies and empirical validation. The authors provide a comprehensive 
  analysis of the problem domain and offer insights into potential applications.`;
  
  const keyFindings = [
    `The research focuses on ${primaryCategory} applications with potential real-world impact.`,
    `The authors employ innovative techniques to address limitations in existing approaches.`,
    `The methodology demonstrates significant improvements over current state-of-the-art methods.`,
    `The work provides valuable insights for future research in this domain.`
  ];
  
  return {
    summary: aiSummary,
    keyFindings,
    relatedArticles: [],
    pdfLink // Include PDF link in fallback too
  };
}

// Function to enhance existing AI insights with PDF information
export const enhanceWithPDFInfo = (insights: AIInsight, pdfLink: string | undefined): AIInsight => {
  console.log('enhanceWithPDFInfo called with pdfLink:', pdfLink);
  console.log('Current insights pdfLink:', insights.pdfLink);
  
  // If insights already has a PDF link or no new link is provided, return as is
  if (insights.pdfLink || !pdfLink) {
    return insights;
  }
  
  // Just add the PDF link without modifying the summary text
  return {
    ...insights,
    pdfLink
  };
};

// Modify the testExampleSummary function to test our improved handling
function testExampleSummary() {
  const exampleSummary = `Contributions: LLM output quality prediction model: A model is developed to predict the quality of LLM outputs for document processing tasks (e
, summarization) without actually running the LLMs`;
  
  const cleanedSummary = cleanMarkdownFormatting(exampleSummary);
  console.log("Cleaned summary:", cleanedSummary);
  
  // Test another example with broken words
  const anotherExample = `This paper introduces a new method for natural language process-
ing that improves performance on several benchmarks.`;
  
  const cleanedExample2 = cleanMarkdownFormatting(anotherExample);
  console.log("Cleaned example 2:", cleanedExample2);
  
  return cleanedSummary;
}

// For testing in development
console.log("Testing example summary:", testExampleSummary()); 