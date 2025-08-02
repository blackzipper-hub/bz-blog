// 静态博客数据服务 - 支持Markdown文件
import { parseMarkdownArticle } from '../utils/markdownParser';

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  categories: string[];
  tags: string[];
  date: string;
  views: number;
  author: string;
}

export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface Tag {
  id: number;
  name: string;
  count: number;
}

interface ArticleIndex {
  id: number;
  slug: string;
  filename: string;
  status: string;
}

class DataService {
  private articles: Article[] = [];
  private categories: Category[] = [];
  private tags: Tag[] = [];
  private initialized = false;

  // 初始化数据
  async initialize() {
    if (this.initialized) return;

    try {
      // 获取正确的基础路径 - 支持多种检测方式
      let baseUrl = process.env.PUBLIC_URL || '';
      
      // 如果在GitHub Pages上，确保路径正确
      if (window.location.hostname.includes('github.io')) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0 && pathSegments[0] === 'bz-blog') {
          baseUrl = '/bz-blog';
        }
      }
      
      console.log('🚀 DataService initialize - BASE_URL:', baseUrl);
      console.log('🚀 Current location:', window.location.href);
      console.log('🚀 Hostname:', window.location.hostname);
      console.log('🚀 Pathname:', window.location.pathname);
      
      // 加载文章索引
      const indexUrl = `${baseUrl}/articles/index.json`;
      console.log('📋 Fetching articles index from:', indexUrl);
      const articlesIndexResponse = await fetch(indexUrl);
      console.log('📋 Articles index response status:', articlesIndexResponse.status);
      
      if (!articlesIndexResponse.ok) {
        throw new Error(`Failed to fetch articles index: ${articlesIndexResponse.status} ${articlesIndexResponse.statusText}`);
      }
      
      const articlesIndex: ArticleIndex[] = await articlesIndexResponse.json();
      console.log('📋 Loaded articles index:', articlesIndex);

      // 加载分类和标签数据
      const categoriesUrl = `${baseUrl}/data/categories.json`;
      const tagsUrl = `${baseUrl}/data/tags.json`;
      console.log('🏷️ Fetching categories from:', categoriesUrl);
      console.log('🔖 Fetching tags from:', tagsUrl);
      
      const [categoriesResponse, tagsResponse] = await Promise.all([
        fetch(categoriesUrl),
        fetch(tagsUrl)
      ]);

      console.log('🏷️ Categories response status:', categoriesResponse.status);
      console.log('🔖 Tags response status:', tagsResponse.status);

      this.categories = await categoriesResponse.json();
      this.tags = await tagsResponse.json();
      console.log('🏷️ Loaded categories:', this.categories.length);
      console.log('🔖 Loaded tags:', this.tags.length);

      // 加载所有Markdown文章
      console.log('📝 Starting to load articles, count:', articlesIndex.length);
      const articlesPromises = articlesIndex.map(async (articleInfo, index) => {
        try {
          const articleUrl = `${baseUrl}/articles/${articleInfo.filename}`;
          console.log(`📄 [${index + 1}/${articlesIndex.length}] Loading article from:`, articleUrl);
          const response = await fetch(articleUrl);
          console.log(`📄 Article ${articleInfo.filename} response status:`, response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const markdownContent = await response.text();
          const article = parseMarkdownArticle(markdownContent, articleInfo.id);
          console.log(`✅ Successfully loaded article: ${article.title}`);
          return article;
        } catch (error) {
          console.error(`❌ Failed to load article: ${articleInfo.filename}`, error);
          return null;
        }
      });

      const loadedArticles = await Promise.all(articlesPromises);
      this.articles = loadedArticles.filter((article): article is Article => article !== null);
      
      this.initialized = true;
      console.log(`🎉 DataService initialization complete! Loaded ${this.articles.length} articles from Markdown files`);
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  // 获取所有文章
  async getArticles(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tag?: string;
  }) {
    await this.initialize();

    let filteredArticles = [...this.articles];

    // 筛选已发布的文章
    filteredArticles = filteredArticles.filter(article => article.status === 'published');

    // 搜索筛选
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(search) ||
        article.excerpt.toLowerCase().includes(search) ||
        article.content.toLowerCase().includes(search)
      );
    }

    // 分类筛选
    if (filters?.category) {
      filteredArticles = filteredArticles.filter(article =>
        article.categories.includes(filters.category!)
      );
    }

    // 标签筛选
    if (filters?.tag) {
      filteredArticles = filteredArticles.filter(article =>
        article.tags.includes(filters.tag!)
      );
    }

    // 按日期排序（最新在前）
    filteredArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 分页
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      total: filteredArticles.length,
      page,
      limit,
      totalPages: Math.ceil(filteredArticles.length / limit)
    };
  }

  // 根据ID获取文章
  async getArticleById(id: number) {
    await this.initialize();
    const article = this.articles.find(article => article.id === id);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  // 根据slug获取文章
  async getArticleBySlug(slug: string) {
    await this.initialize();
    const article = this.articles.find(article => article.slug === slug);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  // 获取所有分类
  async getCategories() {
    await this.initialize();
    return this.categories;
  }

  // 获取所有标签
  async getTags() {
    await this.initialize();
    return this.tags;
  }

  // 获取推荐文章（最新的几篇）
  async getRecommendedArticles(limit = 5) {
    await this.initialize();
    const publishedArticles = this.articles
      .filter(article => article.status === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return publishedArticles.slice(0, limit);
  }

  // 获取相关文章（基于分类和标签）
  async getRelatedArticles(currentArticle: Article, limit = 3) {
    await this.initialize();
    
    const relatedArticles = this.articles
      .filter(article => 
        article.id !== currentArticle.id && 
        article.status === 'published'
      )
      .map(article => {
        let score = 0;
        
        // 相同分类加分
        const commonCategories = article.categories.filter(cat => 
          currentArticle.categories.includes(cat)
        );
        score += commonCategories.length * 2;
        
        // 相同标签加分
        const commonTags = article.tags.filter(tag => 
          currentArticle.tags.includes(tag)
        );
        score += commonTags.length;
        
        return { ...article, score };
      })
      .filter(article => article.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return relatedArticles;
  }

  // 获取博客统计信息
  async getBlogStats() {
    await this.initialize();
    
    const publishedArticles = this.articles.filter(article => article.status === 'published');
    const totalViews = publishedArticles.reduce((sum, article) => sum + article.views, 0);
    
    return {
      totalArticles: publishedArticles.length,
      totalCategories: this.categories.length,
      totalTags: this.tags.length,
      totalViews
    };
  }

  // 获取所有文章的元数据（用于调试）
  async getAllArticlesMetadata() {
    await this.initialize();
    return this.articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      date: article.date,
      categories: article.categories,
      tags: article.tags
    }));
  }
}

// 导出单例实例
export const dataService = new DataService();