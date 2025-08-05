import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { dataService, Article } from '../services/dataService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007acc;
    color: #007acc;
  }
`;

const ArticleHeader = styled.header`
  margin-bottom: 2rem;
  text-align: center;
`;

const ArticleTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CategoryList = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Category = styled.span`
  background: #007acc;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const TagList = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #007acc;
    color: white;
  }
`;

const ArticleContent = styled.article`
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #222;
    line-height: 1.3;
  }

  h1 {
    font-size: 2rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3rem;
  }

  h3 {
    font-size: 1.3rem;
  }

  p {
    margin-bottom: 1.5rem;
  }

  a {
    color: #007acc;
    
    &:hover {
      text-decoration: underline;
    }
  }

  ul, ol {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  blockquote {
    border-left: 4px solid #007acc;
    margin: 2rem 0;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    font-style: italic;
    color: #555;
  }

  pre {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 1.5rem;
    overflow-x: auto;
    margin: 2rem 0;
    font-size: 0.9rem;
  }

  code {
    background: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.9em;
    color: #e83e8c;
  }

  pre code {
    background: none;
    padding: 0;
    color: #333;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 2rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  hr {
    border: none;
    height: 1px;
    background: #eee;
    margin: 3rem 0;
  }
`;

const RelatedArticles = styled.section`
  margin-top: 4rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const RelatedTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const RelatedGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const RelatedCard = styled(Link)`
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: #333;
  }
`;

const RelatedCardTitle = styled.h4`
  margin-bottom: 0.5rem;
  color: #007acc;
  font-size: 1rem;
  line-height: 1.3;
`;

const RelatedCardMeta = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const RelatedCardExcerpt = styled.p`
  font-size: 0.9rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 2rem;
  border-radius: 6px;
  text-align: center;
  margin: 2rem 0;
`;

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError('文章不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const articleData = await dataService.getArticleBySlug(slug);
        setArticle(articleData);

        // 加载相关文章
        const related = await dataService.getRelatedArticles(articleData, 3);
        setRelatedArticles(related);

      } catch (err) {
        setError('文章加载失败，请稍后重试。');
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCategoryClick = (category: string) => {
    const categorySlug = dataService.getCategorySlugByName(category);
    if (categorySlug) {
      navigate(`/category/${categorySlug}`);
    }
  };

  const handleTagClick = (tag: string) => {
    const tagSlug = dataService.getTagSlugByName(tag);
    if (tagSlug) {
      navigate(`/tag/${tagSlug}`);
    }
  };

  if (loading) {
    return <LoadingSpinner>正在加载文章...</LoadingSpinner>;
  }

  if (error || !article) {
    return (
      <Container>
        <ErrorMessage>
          {error || '文章不存在'}
          <br />
          <Link to="/" style={{ color: '#007acc', marginTop: '1rem', display: 'inline-block' }}>
            返回首页
          </Link>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - 个人博客</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.tags.join(', ')} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta name="article:author" content={article.author} />
        <meta name="article:published_time" content={article.date} />
        <meta name="article:section" content={article.categories.join(', ')} />
        <meta name="article:tag" content={article.tags.join(', ')} />
      </Helmet>

      <Container>
        <BackButton onClick={() => navigate(-1)}>
          ← 返回上一页
        </BackButton>

        <ArticleHeader>
          <CategoryList>
            {article.categories.map((category) => (
              <Category
                key={category}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Category>
            ))}
          </CategoryList>

          <ArticleTitle>{article.title}</ArticleTitle>

          <ArticleMeta>
            <MetaItem>
              📅 {formatDate(article.date)}
            </MetaItem>
            <MetaItem>
              👀 {article.views} 次阅读
            </MetaItem>
            <MetaItem>
              ✍️ {article.author}
            </MetaItem>
          </ArticleMeta>

          <TagList>
            {article.tags.map((tag) => (
              <Tag
                key={tag}
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </Tag>
            ))}
          </TagList>
        </ArticleHeader>

        <ArticleContent>
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </ArticleContent>

        {relatedArticles.length > 0 && (
          <RelatedArticles>
            <RelatedTitle>相关文章</RelatedTitle>
            <RelatedGrid>
              {relatedArticles.map((relatedArticle) => (
                <RelatedCard
                  key={relatedArticle.id}
                  to={`/article/${relatedArticle.slug}`}
                >
                  <RelatedCardTitle>{relatedArticle.title}</RelatedCardTitle>
                  <RelatedCardMeta>
                    {formatDate(relatedArticle.date)} • {relatedArticle.views} 次阅读
                  </RelatedCardMeta>
                  <RelatedCardExcerpt>{relatedArticle.excerpt}</RelatedCardExcerpt>
                </RelatedCard>
              ))}
            </RelatedGrid>
          </RelatedArticles>
        )}
      </Container>
    </>
  );
};

export default ArticlePage;