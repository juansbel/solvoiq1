import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Clock, TrendingUp, BookOpen, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import type { KnowledgeArticle, KnowledgeCategory } from '@shared/schema';

interface SmartSearchProps {
  articles: KnowledgeArticle[];
  categories: KnowledgeCategory[];
  onResultsChange: (results: KnowledgeArticle[]) => void;
  className?: string;
}

export function SmartSearch({ articles, categories, onResultsChange, className }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as number[],
    dateRange: 'all',
    sortBy: 'relevance',
    featured: false,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  let results = [];

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useMemo(() => {
    if (!debouncedQuery.trim() && activeFilters.categories.length === 0) {
      return articles;
    }

    let results = articles.filter(article => {
      // Category filter
      if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(article.categoryId || 0)) {
        return false;
      }

      // Text search
      if (debouncedQuery.trim()) {
        const searchTerms = debouncedQuery.toLowerCase().split(' ').filter(term => term.length > 0);
        const searchableText = {
          title: article.title?.toLowerCase() || '',
          content: article.content?.toLowerCase() || '',
          tags: (article.tags || []).join(' ').toLowerCase(),
          excerpt: article.excerpt?.toLowerCase() || ''
        };

        return searchTerms.some(term => 
          Object.values(searchableText).some(text => text.includes(term))
        );
      }

      return true;
    });

    // Apply sorting
    switch (activeFilters.sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'popular':
        results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'alphabetical':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return results;
  }, [articles, debouncedQuery, activeFilters]);

  useEffect(() => {
    onResultsChange(performSearch);
  }, [performSearch, onResultsChange]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim() && !recentSearches.includes(value.trim())) {
      setRecentSearches(prev => [value.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleSearchSubmit = async () => {
    setIsSearching(true);
    try {
      // ... existing code ...
    } catch (error) {
      console.error(error);
      // In a real app, you would show a toast notification to the user
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search knowledge base..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select 
          value={activeFilters.categories[0]?.toString() || 'all'} 
          onValueChange={(value) => setActiveFilters(prev => ({
            ...prev,
            categories: value === 'all' ? [] : [parseInt(value)]
          }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={activeFilters.sortBy} 
          onValueChange={(value) => setActiveFilters(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {recentSearches.length > 0 && !query && (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Recent:</span>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(search)}
                className="text-xs"
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      )}

      {debouncedQuery && (
        <div className="text-sm text-gray-600">
          Found {performSearch.length} result{performSearch.length !== 1 ? 's' : ''} for "{debouncedQuery}"
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Search Results</h3>
        {isSearching ? (
          <div className="mt-4 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : performSearch.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {performSearch.map((result: any) => (
              <li key={result.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                <a href={`/knowledge/${result.id}`} className="block">
                  <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline">{result.title}</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{result.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{result.category}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{result.likes} Likes</span>
                      </span>
                    </div>
                    <span className="text-xs">{new Date(result.createdAt).toLocaleDateString()}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
            <p>No results found. Try a different search query or adjust your filters.</p>
            <p className="text-sm">Maybe you are looking for &quot;How to integrate with Salesforce&quot;?</p>
          </div>
        )}
      </div>
    </div>
  );
}