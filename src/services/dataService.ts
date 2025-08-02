// 静态博客数据服务 - 从JSON文件加载

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
  slug: string;
  count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  count: number;
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
      // 获取正确的基础路径
      const baseUrl = process.env.PUBLIC_URL || '';
      
      // 直接从articles.json加载所有文章数据
      const [articlesResponse, categoriesResponse, tagsResponse] = await Promise.all([
        fetch(`${baseUrl}/data/articles.json`),
        fetch(`${baseUrl}/data/categories.json`),
        fetch(`${baseUrl}/data/tags.json`)
      ]);

      if (!articlesResponse.ok) {
        throw new Error(`Failed to fetch articles: ${articlesResponse.status} ${articlesResponse.statusText}`);
      }

      // 直接解析文章数据，无需额外处理
      this.articles = await articlesResponse.json();
      this.categories = await categoriesResponse.json();
      this.tags = await tagsResponse.json();
      
      this.initialized = true;
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

    // 分类筛选 - 通过slug查找分类名称
    if (filters?.category) {
      const categoryName = this.getCategoryNameBySlug(filters.category);
      if (categoryName) {
        filteredArticles = filteredArticles.filter(article =>
          article.categories.includes(categoryName)
        );
      }
    }

    // 标签筛选 - 通过slug查找标签名称
    if (filters?.tag) {
      const tagName = this.getTagNameBySlug(filters.tag);
      if (tagName) {
        filteredArticles = filteredArticles.filter(article =>
          article.tags.includes(tagName)
        );
      }
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

  // 根据slug获取分类名称
  private getCategoryNameBySlug(slug: string): string | null {
    const category = this.categories.find(cat => cat.slug === slug);
    return category ? category.name : null;
  }

  // 根据slug获取标签名称
  private getTagNameBySlug(slug: string): string | null {
    const tag = this.tags.find(t => t.slug === slug);
    return tag ? tag.name : null;
  }

  // 根据slug获取分类名称 (public)
  async getCategoryNameBySlugAsync(slug: string): Promise<string | null> {
    await this.initialize();
    return this.getCategoryNameBySlug(slug);
  }

  // 根据slug获取标签名称 (public)  
  async getTagNameBySlugAsync(slug: string): Promise<string | null> {
    await this.initialize();
    return this.getTagNameBySlug(slug);
  }

  // 根据名称获取分类slug
  getCategorySlugByName(name: string): string | null {
    const category = this.categories.find(cat => cat.name === name);
    return category ? category.slug : null;
  }

  // 根据名称获取标签slug
  getTagSlugByName(name: string): string | null {
    const tag = this.tags.find(t => t.name === name);
    return tag ? tag.slug : null;
  }
}

// 导出单例实例
export const dataService = new DataService();