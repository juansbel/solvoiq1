import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertKnowledgeCategorySchema, insertKnowledgeArticleSchema, insertKnowledgeCommentSchema, insertKnowledgeBookmarkSchema, insertKnowledgeAnalyticsSchema } from '../../shared/schema';
import { z } from 'zod';

// Knowledge Categories
export async function getKnowledgeCategories(req: Request, res: Response) {
  try {
    if ('getKnowledgeCategories' in storage) {
      const categories = await storage.getKnowledgeCategories();
      res.json(categories);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching knowledge categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function createKnowledgeCategory(req: Request, res: Response) {
  try {
    if ('createKnowledgeCategory' in storage) {
      const validatedData = insertKnowledgeCategorySchema.parse(req.body);
      const category = await storage.createKnowledgeCategory(validatedData);
      res.status(201).json(category);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating knowledge category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
}

export async function updateKnowledgeCategory(req: Request, res: Response) {
  try {
    if ('updateKnowledgeCategory' in storage) {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const category = await storage.updateKnowledgeCategory(id, updates);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    console.error('Error updating knowledge category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteKnowledgeCategory(req: Request, res: Response) {
  try {
    if ('deleteKnowledgeCategory' in storage) {
      const id = parseInt(req.params.id);
      const success = await storage.deleteKnowledgeCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({ success: true });
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    console.error('Error deleting knowledge category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

// Knowledge Articles
export async function getKnowledgeArticles(req: Request, res: Response) {
  try {
    if ('getKnowledgeArticles' in storage) {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        status: req.query.status as string,
        authorId: req.query.authorId as string,
        search: req.query.search as string
      };
      
      const articles = await storage.getKnowledgeArticles(filters);
      res.json(articles);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching knowledge articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
}

export async function getKnowledgeArticle(req: Request, res: Response) {
  try {
    if ('getKnowledgeArticle' in storage && 'getKnowledgeArticleBySlug' in storage) {
      const idOrSlug = req.params.id;
      const article = isNaN(parseInt(idOrSlug)) 
        ? await storage.getKnowledgeArticleBySlug(idOrSlug)
        : await storage.getKnowledgeArticle(parseInt(idOrSlug));
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      // Track view analytics
      if ('trackKnowledgeAnalytics' in storage) {
        await storage.trackKnowledgeAnalytics({
          articleId: article.id,
          action: 'view',
          userId: '1', // Current user - should come from auth
          timeSpent: 0,
          sessionId: req.sessionID || 'anonymous',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          referrer: req.get('Referrer') || ''
        });
      }
      
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error fetching knowledge article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
}

export async function createKnowledgeArticle(req: Request, res: Response) {
  try {
    if ('createKnowledgeArticle' in storage) {
      const validatedData = insertKnowledgeArticleSchema.parse(req.body);
      const article = await storage.createKnowledgeArticle(validatedData);
      res.status(201).json(article);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating knowledge article:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  }
}

export async function updateKnowledgeArticle(req: Request, res: Response) {
  try {
    if ('updateKnowledgeArticle' in storage) {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const article = await storage.updateKnowledgeArticle(id, updates);
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      res.json(article);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    console.error('Error updating knowledge article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
}

export async function deleteKnowledgeArticle(req: Request, res: Response) {
  try {
    if ('deleteKnowledgeArticle' in storage) {
      const id = parseInt(req.params.id);
      const success = await storage.deleteKnowledgeArticle(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      res.json({ success: true });
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    console.error('Error deleting knowledge article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
}

export async function likeKnowledgeArticle(req: Request, res: Response) {
  try {
    if ('getKnowledgeArticle' in storage && 'updateKnowledgeArticle' in storage) {
      const id = parseInt(req.params.id);
      const { action } = req.body;
      
      const article = await storage.getKnowledgeArticle(id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      const likes = (article.likes || 0) + (action === 'like' ? 1 : -1);
      await storage.updateKnowledgeArticle(id, { likes: Math.max(0, likes) });
      
      // Track analytics
      if ('trackKnowledgeAnalytics' in storage) {
        await storage.trackKnowledgeAnalytics({
          articleId: id,
          action: action === 'like' ? 'like' : 'unlike',
          userId: '1', // Current user
          timeSpent: 0
        });
      }
      
      res.json({ success: true, likes });
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ error: 'Failed to update article likes' });
  }
}

// Knowledge Comments
export async function getKnowledgeComments(req: Request, res: Response) {
  try {
    if ('getKnowledgeComments' in storage) {
      const articleId = parseInt(req.params.articleId);
      const comments = await storage.getKnowledgeComments(articleId);
      res.json(comments);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching knowledge comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

export async function createKnowledgeComment(req: Request, res: Response) {
  try {
    if ('createKnowledgeComment' in storage) {
      const validatedData = insertKnowledgeCommentSchema.parse(req.body);
      const comment = await storage.createKnowledgeComment(validatedData);
      res.status(201).json(comment);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating knowledge comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }
}

// Knowledge Revisions
export async function getKnowledgeRevisions(req: Request, res: Response) {
  try {
    if ('getKnowledgeRevisions' in storage) {
      const articleId = parseInt(req.params.articleId);
      const revisions = await storage.getKnowledgeRevisions(articleId);
      res.json(revisions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching knowledge revisions:', error);
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
}

// Knowledge Bookmarks
export async function getUserKnowledgeBookmarks(req: Request, res: Response) {
  try {
    if ('getUserKnowledgeBookmarks' in storage) {
      const userId = '1'; // Current user - should come from auth
      const bookmarks = await storage.getUserKnowledgeBookmarks(userId);
      res.json(bookmarks);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching knowledge bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
}

export async function createKnowledgeBookmark(req: Request, res: Response) {
  try {
    if ('createKnowledgeBookmark' in storage) {
      const articleId = parseInt(req.params.articleId);
      const validatedData = insertKnowledgeBookmarkSchema.parse({
        ...req.body,
        articleId,
        userId: '1' // Current user - should come from auth
      });
      const bookmark = await storage.createKnowledgeBookmark(validatedData);
      res.status(201).json(bookmark);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating knowledge bookmark:', error);
      res.status(500).json({ error: 'Failed to create bookmark' });
    }
  }
}

export async function deleteKnowledgeBookmark(req: Request, res: Response) {
  try {
    if ('deleteKnowledgeBookmark' in storage) {
      const articleId = parseInt(req.params.articleId);
      const userId = '1'; // Current user - should come from auth
      const success = await storage.deleteKnowledgeBookmark(userId, articleId);
      
      if (!success) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }
      
      res.json({ success: true });
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    console.error('Error deleting knowledge bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
}

// Knowledge Analytics
export async function getKnowledgeAnalytics(req: Request, res: Response) {
  try {
    if ('getKnowledgeAnalytics' in storage) {
      const articleId = req.query.articleId ? parseInt(req.query.articleId as string) : undefined;
      const timeframe = req.query.timeframe as string;
      const analytics = await storage.getKnowledgeAnalytics(articleId, timeframe);
      res.json(analytics);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching knowledge analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export async function trackKnowledgeAnalytics(req: Request, res: Response) {
  try {
    if ('trackKnowledgeAnalytics' in storage) {
      const validatedData = insertKnowledgeAnalyticsSchema.parse({
        ...req.body,
        sessionId: req.sessionID || 'anonymous',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        referrer: req.get('Referrer') || ''
      });
      const analytics = await storage.trackKnowledgeAnalytics(validatedData);
      res.status(201).json(analytics);
    } else {
      res.status(501).json({ error: 'Not implemented' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error tracking knowledge analytics:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  }
}

// Knowledge Search
export async function searchKnowledgeArticles(req: Request, res: Response) {
  try {
    if ('getKnowledgeArticles' in storage) {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      
      const articles = await storage.getKnowledgeArticles({ search: query });
      
      // Simple search implementation - filter and score results
      const searchResults = articles
        .filter((article: any) => 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase()) ||
          (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())))
        )
        .map((article: any) => ({
          ...article,
          searchScore: calculateSearchScore(article, query)
        }))
        .sort((a: any, b: any) => b.searchScore - a.searchScore);
      
      // Track search analytics
      if ('trackKnowledgeAnalytics' in storage) {
        await storage.trackKnowledgeAnalytics({
          articleId: 0, // Search event, not specific to an article
          action: 'search',
          userId: '1', // Current user
          metadata: JSON.stringify({ query, resultsCount: searchResults.length }),
          timeSpent: 0
        });
      }
      
      res.json(searchResults);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error searching knowledge articles:', error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
}

function calculateSearchScore(article: any, query: string): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (article.title.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }
  
  // Content match
  if (article.content.toLowerCase().includes(lowerQuery)) {
    score += 5;
  }
  
  // Tag match
  if (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) {
    score += 3;
  }
  
  // Boost for popular articles
  score += (article.viewCount || 0) * 0.1;
  score += (article.likes || 0) * 0.2;
  
  return score;
}