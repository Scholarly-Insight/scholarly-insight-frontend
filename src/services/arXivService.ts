import axios from 'axios';
import { ArXivApiResponse, ArXivArticle, SearchParams } from '../types/arXiv';
import { parseStringPromise } from 'xml2js';

// Base URL for arXiv API
const ARXIV_API_URL = 'http://export.arxiv.org/api/query';

// Helper function to convert XML to JSON
const parseXmlResponse = async (xmlString: string): Promise<ArXivApiResponse> => {

  // console.log("THESTRING", xmlString);

  const entriesArray: String[] = xmlString.split("<entry>");

  // console.log("entriesArray", entriesArray);

  // now iterate through and split more
  const entriesArraySplit: String[][] = [];

  for (let i = 1; i < entriesArray.length; i++) {
    const entry = entriesArray[i];
    const entrySplit = entry.split("\n    ");
    entriesArraySplit.push(entrySplit);
  }

  // console.log("entriesArraySplit", entriesArraySplit);

  const result = [];
  for (let i = 0; i < entriesArraySplit.length; i++) {
    const entry = entriesArraySplit[i];
    const entryObject: any = {
      id: entry[1].replace(/<\/?id>/g, ''),
      updated: entry[2].replace(/<\/?updated>/g, ''),
      published: entry[3].replace(/<\/?published>/g, ''),
      title: entry[4].replace(/<\/?title>/g, ''),
      summary: entry[5].replace(/<\/?summary>/g, ''),
      paper_link: '',
      pdf_link: '',
      authors: [],
      categories: [],
      primary_category: null
    };

    let startIndex = 6;

    //Parse authors
    while (entry[startIndex].includes("<author>")) {
      startIndex += 1; // Move to the name line
      const name = entry[startIndex].replace(/<\/?name>/g, '');
      
      // Check if the next element is an affiliation
      let affiliation = undefined;
      if (entry[startIndex + 1] && entry[startIndex + 1].includes("<arxiv:affiliation")) {
        affiliation = entry[startIndex + 1].replace(/<\/?arxiv:affiliation[^>]*>/g, '');
        startIndex += 3; // Skip affiliation and author closing tag
      } else {
        startIndex += 2; // skip the author closing tag
      }
      

      entryObject.authors.push({ 
        name: name, 
        affiliation: affiliation 
      });
    }


    
    //Parse arxiv link and pdf link
    for (let j = startIndex; j < entry.length; j++) {
      const line = entry[j];
      
      // Parse categories
      if (line.includes("<category")) {
        const term = line.match(/term="([^"]+)"/)?.[1] || '';
        const scheme = line.match(/scheme="([^"]+)"/)?.[1] || '';
        const label = line.match(/label="([^"]+)"/)?.[1] || '';
        
        const category = { term, scheme, label };
        entryObject.categories.push(category);
        
        // If primary_category is not set yet, set it to the first category
        if (!entryObject.primary_category) {
          entryObject.primary_category = category;
        }
      }

      if (line.includes("<link")) {
        if (line.includes('rel="alternate"')) {
          entryObject.paperLink = line.match(/href="([^"]+)"/)?.[1] || '';
        } else if (line.includes('title="pdf"')) {
          entryObject.pdfLink = line.match(/href="([^"]+)"/)?.[1] || '';
        }
      }
    }

    result.push(entryObject);
  }

  // console.log("RESULT", result);

  


  try {
    // const result = await parseStringPromise(xmlString, {
    //   explicitArray: false,
    //   mergeAttrs: true,
    // });

    // console.log("RESULT", result);

    // Transform the XML response to match our ArXivApiResponse type
    const entries = result;
    // Array.isArray(result.feed.entry)
    //   ? result.feed.entry
    //   : result.feed.entry ? [result.feed.entry] : [];

    const formattedEntries = entries.map((entry: any) => {
      // Format authors
      const authors = Array.isArray(entry.author)
        ? entry.author.map((author: any) => ({ name: author.name }))
        : entry.author ? [{ name: entry.author.name }] : [];

      // Format categories
      const categories = Array.isArray(entry.category)
        ? entry.category.map((category: any) => ({
            term: category.term,
            scheme: category.scheme,
            label: category.label
          }))
        : entry.category ? [{
            term: entry.category.term,
            scheme: entry.category.scheme,
            label: entry.category.label
          }] : [];

      // Format links
      const links = Array.isArray(entry.link)
        ? entry.link.map((link: any) => ({
            href: link.href,
            rel: link.rel,
            title: link.title,
            type: link.type
          }))
        : entry.link ? [{
            href: entry.link.href,
            rel: entry.link.rel,
            title: entry.link.title,
            type: entry.link.type
          }] : [];

      return {
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        published: entry.published,
        updated: entry.updated,
        authors: entry.authors,
        categories: entry.categories,
        //do we need links here?
        links,
        doi: entry['arxiv:doi'],
        journal_ref: entry['arxiv:journal_ref'],
        comment: entry['arxiv:comment'],
        primary_category: entry.primary_category || entry.categories[0] || {
          term: '',
          scheme: '',
          label: ''
        },
        paper_link: entry.paperLink,
        pdf_link: entry.pdfLink,
      };
    });

    return {
      feed: {
        entry: formattedEntries,
        totalResults: formattedEntries.length,
        startIndex: 0,
        itemsPerPage: formattedEntries.length,
      }
    };
  } catch (error) {
    console.error('Error parsing XML response:', error);
    throw new Error('Failed to parse arXiv API response');
  }
};

export const searchArticles = async (params: SearchParams): Promise<ArXivApiResponse> => {
  try {
    // Build the search query
    let query = params.searchQuery || 'all';

    // Add category filter if provided
    if (params.categories && params.categories.length > 0) {
      query += ` AND cat:(${params.categories.join(' OR ')})`;
    }

    // Add date range if provided
    if (params.dateFrom) {
      query += ` AND submittedDate:[${params.dateFrom} TO `;
      query += params.dateTo ? params.dateTo : '*';
      query += ']';
    }

    // Set up sort parameters
    const sortPrefix = params.sortOrder === 'descending' ? '-' : '';
    let sortKey = '';

    switch (params.sortBy) {
      case 'lastUpdated':
        sortKey = `${sortPrefix}lastUpdatedDate`;
        break;
      case 'submitted':
        sortKey = `${sortPrefix}submittedDate`;
        break;
      default:
        sortKey = 'relevance';
    }

    const response = await axios.get(ARXIV_API_URL, {
      params: {
        search_query: query,
        start: params.startIndex,
        max_results: params.maxResults,
        sortBy: sortKey,
      },
      headers: {
        'Accept': 'application/xml',
      },
    });
    return parseXmlResponse(response.data);
  } catch (error) {
    console.error('Error searching arXiv articles:', error);
    throw new Error('Failed to search arXiv articles');
  }
};

export const getArticleById = async (articleId: string): Promise<ArXivArticle> => {
  try {
    const response = await axios.get(ARXIV_API_URL, {
      params: {
        id_list: articleId,
      },
      headers: {
        'Accept': 'application/xml',
      },
    });

    const result = await parseXmlResponse(response.data);
    if (result.feed.entry.length === 0) {
      throw new Error('Article not found');
    }

    return result.feed.entry[0];
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw new Error('Failed to fetch article details');
  }
};

export const getRecentArticles = async (categories: string[] = [], maxResults = 10): Promise<ArXivApiResponse> => {
  try {
    let query = '';

    // Add category filter if provided
    if (categories && categories.length > 0) {
      query = `cat:(${categories.join(' OR ')})`;
    }

    const response = await axios.get(ARXIV_API_URL, {
      params: {
        search_query: query || 'all',
        start: 0,
        max_results: maxResults,
        sortBy: '-lastUpdatedDate',
      },
      headers: {
        'Accept': 'application/xml',
      },
    });

    return parseXmlResponse(response.data);
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    throw new Error('Failed to fetch recent articles');
  }
};
