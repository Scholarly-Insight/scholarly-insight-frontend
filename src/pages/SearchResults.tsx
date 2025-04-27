import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchArticles } from '../services/arXivService';
import { ArXivArticle, SearchParams } from '../types/arXiv';
import { format } from 'date-fns';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<ArXivArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState("");

  // Get search parameters
  const searchQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const author = searchParams.get('author') || '';

  // Initialize the query state with the URL search query
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const resultsPerPage = 20;

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        let queryString = searchQuery;

        // If there's a category filter
        if (category) {
          queryString = queryString ? `${queryString} AND cat:${category}` : `cat:${category}`;
        }

        // If there's an author filter
        if (author) {
          queryString = queryString ? `${queryString} AND au:${author}` : `au:${author}`;
        }

        // If no query was provided, search for all
        if (!queryString) {
          queryString = 'all';
        }

        console.log('Executing search with query:', queryString);

        const params: SearchParams = {
          searchQuery: queryString,
          sortBy: 'relevance',
          sortOrder: 'descending',
          startIndex: (page - 1) * resultsPerPage,
          maxResults: resultsPerPage,
        };
        const response = await searchArticles(params);
        setArticles(response.feed.entry);
        setTotalResults(response.feed.totalResults || response.feed.entry.length);
        setError(null);
      } catch (err) {
        setError('Failed to fetch search results. Please try again later.');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, category, author, page]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Create new search params preserving category and author if present
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (category) newParams.set('category', category);
    if (author) newParams.set('author', author);
    
    // Update URL params and reset to page 1
    setSearchParams(newParams);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderArticleItem = (article: ArXivArticle) => {
    const publishDate = new Date(article.published);

    // console.log(article.published);

    return (
      <div key={article.id} className="article-card mb-4">
        <h3 className="text-lg font-medium text-scholarly-text mb-2">
          <Link to={`/article/${article.id.split('/').pop()}`} className="hover:text-scholarly-primary">
            {article.title}
          </Link>
        </h3>
        <div className="flex items-center text-scholarly-secondaryText text-sm mb-2">
          <span className="mr-2">{format(publishDate, 'MMM d, yyyy')}</span>
          <span className="mr-2">•</span>
          <span>{article.primary_category.term}</span>
        </div>
        <p className="text-scholarly-secondaryText text-sm mb-2">
          {article.authors.slice(0, 3).map(author => author.name).join(', ')}
          {article.authors.length > 3 && ', et al.'}
        </p>
        <p className="text-scholarly-text line-clamp-2">
          {article.summary.substring(0, 200)}...
        </p>
        <div className="mt-2">
          <Link
            to={`/article/${article.id.split('/').pop()}`}
            className="text-scholarly-primary text-sm hover:underline"
          >
            Read more
          </Link>
          {article.paper_link && (
            <a 
              href={article.paper_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-scholarly-primary text-sm hover:underline"
            >
              arXiv Page
            </a>
          )}

            {article.pdf_link && (
            <a 
              href={article.pdf_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-scholarly-primary text-sm hover:underline flex items-center"
            >
              <span>PDF</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    );
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Generate pagination array
  const getPaginationArray = () => {
    const paginationArray = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        paginationArray.push(i);
      }
    } else {
      // Show a subset of pages with ellipsis
      if (page <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          paginationArray.push(i);
        }
        paginationArray.push('...');
        paginationArray.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Near end
        paginationArray.push(1);
        paginationArray.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          paginationArray.push(i);
        }
      } else {
        // Middle
        paginationArray.push(1);
        paginationArray.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          paginationArray.push(i);
        }
        paginationArray.push('...');
        paginationArray.push(totalPages);
      }
    }

    return paginationArray;
  };


  async function QuerySearch() {
    console.log("QuerySearch", query);
    const response = await searchArticles({searchQuery: query, sortBy: 'relevance', sortOrder: 'descending', startIndex: 0, maxResults: 20});
    setArticles(response.feed.entry);
    setTotalResults(response.feed.totalResults || response.feed.entry.length);
    setError(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search filters and info */}
      <div className="bg-white rounded-lg shadow-scholarly-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-scholarly-text mb-2 md:mb-0">
            Search Results
            {(searchQuery || category || author) && (
              <span className="font-normal text-scholarly-secondaryText ml-2">
                for {searchQuery || category || author}
              </span>
            )}
          </h1>

          <div className="text-sm text-scholarly-secondaryText">
            {loading ? 'Searching...' : `${totalResults} results found`}
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Refine your search..."
              className="w-full py-2 px-3 pr-10 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-scholarly-primary text-white rounded-lg px-3 py-1"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Applied filters */}
      {(category || author) && (
        <div className="bg-white rounded-lg shadow-scholarly-card p-4 mb-6">
          <h2 className="text-md font-medium text-scholarly-text mb-2">Applied Filters</h2>
          <div className="flex flex-wrap gap-2">
            {category && (
              <div className="bg-scholarly-buttonBg text-scholarly-text px-3 py-1 rounded-full text-sm flex items-center">
                <span className="mr-1">Category: {category}</span>
                <Link to={`/search${searchQuery ? `?q=${searchQuery}` : ''}${author ? `&author=${author}` : ''}`}>
                  <span className="font-bold">×</span>
                </Link>
              </div>
            )}

            {author && (
              <div className="bg-scholarly-buttonBg text-scholarly-text px-3 py-1 rounded-full text-sm flex items-center">
                <span className="mr-1">Author: {author}</span>
                <Link to={`/search${searchQuery ? `?q=${searchQuery}` : ''}${category ? `&category=${category}` : ''}`}>
                  <span className="font-bold">×</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-scholarly-primary border-t-transparent"></div>
          <p className="mt-2 text-scholarly-secondaryText">Searching for relevant papers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-scholarly-card p-8 text-center">
          <h2 className="text-xl font-medium text-scholarly-text mb-2">No results found</h2>
          <p className="text-scholarly-secondaryText mb-4">
            Try adjusting your search criteria or exploring different categories.
          </p>
          <Link to="/" className="text-scholarly-primary hover:underline">
            Return to home page
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {articles.map(renderArticleItem)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-scholarly-buttonBg text-scholarly-text hover:bg-scholarly-hoverBg'
                  }`}
                >
                  Previous
                </button>

                {getPaginationArray().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                    disabled={pageNum === '...'}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      pageNum === page
                        ? 'bg-scholarly-primary text-white'
                        : pageNum === '...'
                          ? 'bg-transparent cursor-default'
                          : 'bg-scholarly-buttonBg text-scholarly-text hover:bg-scholarly-hoverBg'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-scholarly-buttonBg text-scholarly-text hover:bg-scholarly-hoverBg'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
