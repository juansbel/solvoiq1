import React, { useState, useMemo } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { SmartSearch } from '@/components/knowledge/smart-search';
import { ContentAnalytics } from '@/components/knowledge/content-analytics';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Star, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  Calendar,
  User,
  Tag,
  Bookmark,
  Share2,
  Edit,
  Trash2,
  Workflow,
  Shield,
  Globe,
  Lightbulb,
  GraduationCap,
  Code,
  TrendingUp,
  Clock,
  FileText,
  Archive
} from 'lucide-react';
import type { KnowledgeArticle, KnowledgeCategory, KnowledgeAnalytics } from '@/../../shared/schema';

const categoryIcons = {
  Workflow,
  Shield,
  Globe,
  Lightbulb,
  GraduationCap,
  Code,
  FileText,
  BookOpen
};

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('title');
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryClient = useQueryClient();

  // Fetch data
  const { data: articles = [], isLoading: articlesLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge/articles'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<KnowledgeCategory[]>({
    queryKey: ['/api/knowledge/categories'],
  });

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery<KnowledgeAnalytics[]>({
    queryKey: ['/api/knowledge/analytics'],
  });

  // Helper functions
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles;

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (article.tags && article.tags.some(tag => 
          tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        ))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(article => article.categoryId === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'created':
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case 'updated':
        filtered = filtered.sort((a, b) => 
          new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );
        break;
      case 'views':
        filtered = filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'likes':
        filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }

    return filtered;
  }, [articles, debouncedSearchQuery, selectedCategory, sortBy]);

  // Article click handler
  const handleArticleClick = async (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    
    // Track view analytics
    try {
      await fetch('/api/knowledge/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          userId: 'current-user',
          action: 'view',
          sessionId: 'session-123',
          timeSpent: 0
        })
      });
    } catch (error) {
      console.log('Analytics tracking skipped:', error);
    }
  };

  if (articlesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Knowledge Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Center</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Your central hub for documentation, processes, and organizational knowledge
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <Button onClick={() => setShowCategoryManagement(true)} variant="outline">
              <Archive className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Articles</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{articles.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-700 dark:text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">Published</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {articles.filter(a => a.status === 'published').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-700 dark:text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Views</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {articles.reduce((sum, article) => sum + (article.viewCount || 0), 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-700 dark:text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Categories</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{categories.length}</p>
                </div>
                <Archive className="h-8 w-8 text-orange-700 dark:text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="search">Smart Search</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search Knowledge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => {
                      const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons] || BookOpen;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <IconComponent className="h-4 w-4 mr-2" style={{ color: category.color }} />
                          {category.name}
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Sort Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Sort By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title A-Z</SelectItem>
                        <SelectItem value="created">Newest First</SelectItem>
                        <SelectItem value="updated">Recently Updated</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {/* Articles Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedArticles.map((article) => {
                    const category = categories.find(cat => cat.id === article.categoryId);
                    const IconComponent = category ? categoryIcons[category.icon as keyof typeof categoryIcons] || BookOpen : BookOpen;
                    
                    return (
                      <Card 
                        key={article.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleArticleClick(article)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {category && (
                                <div 
                                  className="p-1 rounded"
                                  style={{ backgroundColor: `${category.color}20` }}
                                >
                                  <IconComponent 
                                    className="h-4 w-4" 
                                    style={{ color: category.color }}
                                  />
                                </div>
                              )}
                              <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                {article.status}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                            {truncateContent(article.content, 120)}
                          </p>
                          
                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {article.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{article.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.viewCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {article.likes || 0}
                              </span>
                            </div>
                            <span>{formatDate(article.updatedAt || article.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {filteredAndSortedArticles.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No articles found</h3>
                      <p className="text-gray-600">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <SmartSearch
              articles={articles}
              categories={categories}
              onResultsChange={setFilteredArticles}
              className="mb-6"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                {(filteredArticles.length > 0 ? filteredArticles : filteredAndSortedArticles).map(article => (
                  <Card key={article.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {article.title}
                        </h3>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                          {article.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {truncateContent(article.content || '', 200)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {article.authorId}</span>
                        <span>{formatDate(article.updatedAt || article.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Bookmarked Articles</h3>
                <p className="text-gray-600">Your saved articles will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <ContentAnalytics articles={articles} />
          </TabsContent>
        </Tabs>

        {/* Category Management Modal */}
        {showCategoryManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 m-4">
              <h2 className="text-xl font-bold mb-4">Category Management</h2>
              <p className="text-gray-600 mb-4">Category management features coming soon!</p>
              <Button onClick={() => setShowCategoryManagement(false)}>Close</Button>
            </div>
          </div>
        )}

        {/* Article Detail Modal */}
        {selectedArticle && (
          <ArticleDetailModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            categories={categories}
          />
        )}

        {/* Create Article Modal */}
        {showCreateModal && (
          <CreateArticleModal
            categories={categories}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
            }}
          />
        )}
      </div>
    </div>
  );
}

// Article Detail Modal Component
function ArticleDetailModal({ 
  article, 
  onClose, 
  categories 
}: { 
  article: KnowledgeArticle; 
  onClose: () => void;
  categories: KnowledgeCategory[];
}) {
  const category = categories.find(cat => cat.id === article.categoryId);
  const IconComponent = category ? categoryIcons[category.icon as keyof typeof categoryIcons] || BookOpen : BookOpen;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {category && (
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <IconComponent 
                  className="h-6 w-6" 
                  style={{ color: category.color }}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span>By Author {article.authorId}</span>
                <span>•</span>
                <span>{new Date(article.createdAt || new Date()).toLocaleDateString()}</span>
                <span>•</span>
                <span>{article.viewCount || 0} views</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6">
          <div className="prose max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap">{article.content}</div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
              {article.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Like ({article.likes || 0})
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Article Modal Component
function CreateArticleModal({ 
  categories, 
  onClose, 
  onSuccess 
}: { 
  categories: KnowledgeCategory[]; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState('');

  const queryClient = useQueryClient();

  const createArticleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/knowledge/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create article');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createArticleMutation.mutate({
      title,
      content,
      categoryId,
      authorId: 'current-user',
      status: 'draft',
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create New Article</h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={categoryId?.toString() || ''} onValueChange={(value) => setCategoryId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here..."
              className="w-full h-64 p-3 border rounded-md resize-none"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createArticleMutation.isPending}>
              {createArticleMutation.isPending ? 'Creating...' : 'Create Article'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}