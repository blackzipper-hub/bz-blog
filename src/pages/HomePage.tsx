import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { dataService, Article } from '../services/dataService';

const Hero = styled.section`
  background: linear-gradient(135deg, #007acc, #17a2b8);
  color: white;
  padding: 3rem 0;
  text-align: center;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.main`
  min-height: 400px;
`;

const Sidebar = styled.aside`
  @media (max-width: 992px) {
    order: -1;
  }
`;

const SearchFilters = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
  }
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterTag = styled.button<{ active?: boolean }>`
  padding: 0.4rem 0.8rem;
  border: 1px solid ${props => props.active ? '#007acc' : '#ddd'};
  background: ${props => props.active ? '#007acc' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007acc;
    background: ${props => props.active ? '#0056b3' : '#f0f8ff'};
  }
`;

const ArticleGrid = styled.div`
  display: grid;
  gap: 2rem;
`;

const ArticleCard = styled.article`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ArticleContent = styled.div`
  padding: 1.5rem;
`;

const ArticleTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: #007acc;
    }
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const ArticleExcerpt = styled.div`
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;

  p {
    margin: 0;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #007acc;
    color: white;
  }
`;

const CategoryList = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Category = styled.span`
  background: #007acc;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#007acc' : '#ddd'};
  background: ${props => props.active ? '#007acc' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #007acc;
    background: ${props => props.active ? '#0056b3' : '#f0f8ff'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  margin: 2rem 0;
`;

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState<Array<{id: number, name: string, count: number}>>([]);
  const [tags, setTags] = useState<Array<{id: number, name: string, count: number}>>([]);

  const location = useLocation();
  const { category, tag } = useParams();

  // 从URL参数获取筛选条件
  useEffect(() => {
    const loadUrlParams = async () => {
      const params = new URLSearchParams(location.search);
      const search = params.get('search') || '';
      setSearchQuery(search);
      
      // 将slug转换为名称
      if (category) {
        const categoryName = await dataService.getCategoryNameBySlugAsync(category);
        setSelectedCategory(categoryName || '');
      } else {
        setSelectedCategory('');
      }
      
      if (tag) {
        const tagName = await dataService.getTagNameBySlugAsync(tag);
        setSelectedTag(tagName || '');
      } else {
        setSelectedTag('');
      }
    };
    
    loadUrlParams();
  }, [location.search, category, tag]);

  // 加载分类和标签
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          dataService.getCategories(),
          dataService.getTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };

    loadMetadata();
  }, []);

  // 加载文章
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        // 将名称转换为slug传递给dataService
        const categorySlug = selectedCategory ? dataService.getCategorySlugByName(selectedCategory) : '';
        const tagSlug = selectedTag ? dataService.getTagSlugByName(selectedTag) : '';
        
        const result = await dataService.getArticles({
          page: currentPage,
          limit: 10,
          search: searchQuery,
          category: categorySlug || undefined,
          tag: tagSlug || undefined
        });

        setArticles(result.articles);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError('加载文章失败，请稍后重试。');
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentPage, searchQuery, selectedCategory, selectedTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    window.history.pushState({}, '', `/?${params.toString()}`);
  };

  const handleCategoryFilter = (categoryName: string) => {
    const categorySlug = dataService.getCategorySlugByName(categoryName);
    const newSelectedCategory = categoryName === selectedCategory ? '' : categoryName;
    
    console.log('🏷️ Category Filter:', { categoryName, categorySlug, newSelectedCategory });
    
    setSelectedCategory(newSelectedCategory);
    setSelectedTag('');
    setCurrentPage(1);
    
    if (newSelectedCategory && categorySlug) {
      const newUrl = `/category/${categorySlug}`;
      console.log('🌐 Navigating to:', newUrl);
      window.history.pushState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleTagFilter = (tagName: string) => {
    const tagSlug = dataService.getTagSlugByName(tagName);
    const newSelectedTag = tagName === selectedTag ? '' : tagName;
    
    console.log('🔖 Tag Filter:', { tagName, tagSlug, newSelectedTag });
    
    setSelectedTag(newSelectedTag);
    setSelectedCategory('');
    setCurrentPage(1);
    
    if (newSelectedTag && tagSlug) {
      const newUrl = `/tag/${tagSlug}`;
      console.log('🌐 Navigating to:', newUrl);
      window.history.pushState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPageTitle = () => {
    if (selectedCategory) return `${selectedCategory} - 个人博客`;
    if (selectedTag) return `${selectedTag} - 个人博客`;
    if (searchQuery) return `搜索: ${searchQuery} - 个人博客`;
    return '个人博客 - 分享技术与生活';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content="个人技术博客，分享前端开发、React、Node.js等技术文章和个人感悟" />
        <meta name="keywords" content="博客,前端,React,JavaScript,Node.js,技术分享" />
      </Helmet>

      <Hero>
        <Container>
          <HeroTitle>欢迎来到我的博客</HeroTitle>
          <HeroSubtitle>分享技术文章、生活感悟和学习心得</HeroSubtitle>
        </Container>
      </Hero>

      <Container>
        <ContentArea>
          <MainContent>
            {loading ? (
              <LoadingSpinner>正在加载文章...</LoadingSpinner>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <>
                <ArticleGrid>
                  {articles.map((article) => (
                    <ArticleCard key={article.id}>
                      <ArticleContent>
                        <CategoryList>
                          {article.categories.map((cat) => (
                            <Category 
                              key={cat} 
                              onClick={() => handleCategoryFilter(cat)}
                            >
                              {cat}
                            </Category>
                          ))}
                        </CategoryList>
                        
                        <ArticleTitle>
                          <Link to={`/article/${article.slug}`}>
                            {article.title}
                          </Link>
                        </ArticleTitle>
                        
                        <ArticleMeta>
                          <span>📅 {formatDate(article.date)}</span>
                          <span>👀 {article.views} 次阅读</span>
                          <span>✍️ {article.author}</span>
                        </ArticleMeta>
                        
                        <ArticleExcerpt>
                          <ReactMarkdown>{article.excerpt}</ReactMarkdown>
                        </ArticleExcerpt>
                        
                        <TagList>
                          {article.tags.map((tagName) => (
                            <Tag 
                              key={tagName} 
                              onClick={() => handleTagFilter(tagName)}
                            >
                              #{tagName}
                            </Tag>
                          ))}
                        </TagList>
                      </ArticleContent>
                    </ArticleCard>
                  ))}
                </ArticleGrid>

                {totalPages > 1 && (
                  <Pagination>
                    <PageButton
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </PageButton>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PageButton
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PageButton>
                    ))}
                    
                    <PageButton
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </PageButton>
                  </Pagination>
                )}
              </>
            )}
          </MainContent>

          <Sidebar>
            <SearchFilters>
              <FilterTitle>搜索与筛选</FilterTitle>
              
              <form onSubmit={handleSearch}>
                <SearchInput
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <FilterSection>
                <FilterTitle>分类</FilterTitle>
                <FilterList>
                  {categories.map((cat) => (
                    <FilterTag
                      key={cat.id}
                      active={selectedCategory === cat.name}
                      onClick={() => handleCategoryFilter(cat.name)}
                    >
                      {cat.name} ({cat.count})
                    </FilterTag>
                  ))}
                </FilterList>
              </FilterSection>

              <FilterSection>
                <FilterTitle>标签</FilterTitle>
                <FilterList>
                  {tags.map((tag) => (
                    <FilterTag
                      key={tag.id}
                      active={selectedTag === tag.name}
                      onClick={() => handleTagFilter(tag.name)}
                    >
                      #{tag.name} ({tag.count})
                    </FilterTag>
                  ))}
                </FilterList>
              </FilterSection>
            </SearchFilters>
          </Sidebar>
        </ContentArea>
      </Container>
    </>
  );
};

export default HomePage;