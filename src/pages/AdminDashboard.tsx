import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  views: number;
  categories: string[];
  tags: string[];
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DashboardContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 200px);
`;

const Sidebar = styled.nav<{ isOpen: boolean }>`
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    transition: transform 0.3s ease-in-out;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1.5rem;
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarItem = styled.li`
  margin-bottom: 0.5rem;
`;

const SidebarLink = styled(Link)<{ active?: boolean }>`
  display: block;
  padding: 0.75rem 1rem;
  color: ${props => props.active ? '#007acc' : '#6c757d'};
  background-color: ${props => props.active ? '#e3f2fd' : 'transparent'};
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #e9ecef;
    color: #007acc;
    text-decoration: none;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'outline' }>`
  padding: 0.5rem 1rem;
  border: 2px solid;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #007acc;
          color: white;
          border-color: #007acc;
          &:hover { background-color: #0056b3; border-color: #0056b3; }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          border-color: #dc3545;
          &:hover { background-color: #c82333; border-color: #c82333; }
        `;
      default:
        return `
          background-color: transparent;
          color: #007acc;
          border-color: #007acc;
          &:hover { background-color: #007acc; color: white; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.375rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #212529;
  border-bottom: 1px solid #dee2e6;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  color: #6c757d;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.status === 'published' ? '#d4edda' : '#fff3cd'};
  color: ${props => props.status === 'published' ? '#155724' : '#856404'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  background-color: #dc3545;
  color: white;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  
  h3 {
    margin-bottom: 1rem;
    color: #212529;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Overlay = styled.div<{ show: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const ArticleEditor = styled.div`
  background: white;
  border-radius: 0.375rem;
  padding: 2rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #212529;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  min-height: 300px;
  resize: vertical;
  font-family: 'Monaco', 'Consolas', monospace;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 检查是否已登录且是管理员
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  if (!user) {
    return <LoadingSpinner>正在验证权限...</LoadingSpinner>;
  }

  return (
    <>
      <Helmet>
        <title>管理后台 - 个人博客</title>
        <meta name="description" content="个人博客管理后台" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <MobileMenuButton onClick={() => setSidebarOpen(true)}>
        ☰
      </MobileMenuButton>

      <Overlay show={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <DashboardContainer>
        <Sidebar isOpen={sidebarOpen}>
          <SidebarTitle>管理后台</SidebarTitle>
          <SidebarMenu>
            <SidebarItem>
              <SidebarLink 
                to="/admin"
                active={location.pathname === '/admin'}
                onClick={() => setSidebarOpen(false)}
              >
                📊 概览
              </SidebarLink>
            </SidebarItem>
            <SidebarItem>
              <SidebarLink 
                to="/admin/articles"
                active={location.pathname.startsWith('/admin/articles')}
                onClick={() => setSidebarOpen(false)}
              >
                📝 文章管理
              </SidebarLink>
            </SidebarItem>
            <SidebarItem>
              <SidebarLink 
                to="/admin/new-article"
                active={location.pathname === '/admin/new-article'}
                onClick={() => setSidebarOpen(false)}
              >
                ➕ 写新文章
              </SidebarLink>
            </SidebarItem>
            <SidebarItem>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  color: '#6c757d',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                }}
              >
                🚪 退出登录
              </button>
            </SidebarItem>
          </SidebarMenu>
        </Sidebar>

        <MainContent>
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/new-article" element={<NewArticle />} />
            <Route path="/edit-article/:id" element={<EditArticle />} />
          </Routes>
        </MainContent>
      </DashboardContainer>
    </>
  );
};

// 概览页面组件
const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/articles/admin/all?limit=1000');
        const articles = response.data.articles;
        
        const totalArticles = articles.length;
        const publishedArticles = articles.filter((a: Article) => a.status === 'published').length;
        const draftArticles = articles.filter((a: Article) => a.status === 'draft').length;
        const totalViews = articles.reduce((sum: number, a: Article) => sum + a.views, 0);
        
        setStats({
          totalArticles,
          publishedArticles,
          draftArticles,
          totalViews
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner>正在加载统计数据...</LoadingSpinner>;
  }

  return (
    <>
      <PageHeader>
        <PageTitle>控制台概览</PageTitle>
      </PageHeader>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.375rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.875rem' }}>总文章数</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#007acc' }}>{stats.totalArticles}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.375rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.875rem' }}>已发布</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#28a745' }}>{stats.publishedArticles}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.375rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.875rem' }}>草稿</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#ffc107' }}>{stats.draftArticles}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.375rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.875rem' }}>总阅读量</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#17a2b8' }}>{stats.totalViews}</p>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.375rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
        <h2 style={{ marginBottom: '1rem' }}>快速操作</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/new-article" style={{ textDecoration: 'none' }}>
            <Button variant="primary">✏️ 写新文章</Button>
          </Link>
          <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
            <Button variant="outline">📋 管理文章</Button>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="outline">🏠 查看网站</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

// 文章列表组件
const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<ArticlesResponse>('/api/articles/admin/all?limit=100');
      setArticles(response.data.articles);
    } catch (error) {
      console.error('获取文章失败:', error);
      setError('获取文章失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`确定要删除文章"${title}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await axios.delete(`/api/articles/${id}`);
      setArticles(articles.filter(article => article.id !== id));
    } catch (error) {
      console.error('删除文章失败:', error);
      alert('删除文章失败，请稍后重试');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return <LoadingSpinner>正在加载文章...</LoadingSpinner>;
  }

  return (
    <>
      <PageHeader>
        <PageTitle>文章管理</PageTitle>
        <Link to="/admin/new-article" style={{ textDecoration: 'none' }}>
          <Button variant="primary">➕ 写新文章</Button>
        </Link>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {articles.length === 0 ? (
        <EmptyState>
          <h3>还没有文章</h3>
          <p>开始写你的第一篇文章吧！</p>
          <Link to="/admin/new-article" style={{ textDecoration: 'none' }}>
            <Button variant="primary">写新文章</Button>
          </Link>
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>标题</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell>发布时间</TableHeaderCell>
              <TableHeaderCell>阅读量</TableHeaderCell>
              <TableHeaderCell>操作</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <strong>{article.title}</strong>
                  {article.excerpt && (
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      {article.excerpt.substring(0, 100)}...
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={article.status}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{formatDate(article.created_at)}</TableCell>
                <TableCell>{article.views}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to={`/admin/edit-article/${article.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="outline">编辑</Button>
                    </Link>
                    <Link to={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="outline">查看</Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      onClick={() => handleDelete(article.id, article.title)}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

// 新建文章组件
const NewArticle: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    status: 'draft',
    categories: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError('标题和内容不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      await axios.post('/api/articles', payload);
      navigate('/admin/articles');
    } catch (error: any) {
      console.error('创建文章失败:', error);
      setError(error.response?.data?.message || '创建文章失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <PageHeader>
        <PageTitle>写新文章</PageTitle>
        <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
          <Button variant="outline">← 返回文章列表</Button>
        </Link>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ArticleEditor>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="输入文章标题"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="slug">URL别名</Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              placeholder="留空将自动生成"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="excerpt">摘要</Label>
            <Input
              id="excerpt"
              name="excerpt"
              type="text"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="文章摘要（留空将自动生成）"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="categories">分类</Label>
            <Input
              id="categories"
              name="categories"
              type="text"
              value={formData.categories}
              onChange={handleChange}
              placeholder="用逗号分隔多个分类，如：技术,前端"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="用逗号分隔多个标签，如：React,JavaScript"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">状态</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="content">内容 * (支持Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="使用Markdown语法编写文章内容..."
              required
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? '保存中...' : '保存文章'}
            </Button>
            <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
              <Button type="button" variant="outline">取消</Button>
            </Link>
          </div>
        </form>
      </ArticleEditor>
    </>
  );
};

// 编辑文章组件
const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    status: 'draft',
    categories: '',
    tags: ''
  });

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('文章ID无效');
        setLoadingArticle(false);
        return;
      }

      try {
        const response = await axios.get(`/api/articles/${id}`);
        const article = response.data;
        
        setFormData({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || '',
          slug: article.slug || '',
          status: article.status,
          categories: article.categories.join(', '),
          tags: article.tags.join(', ')
        });
      } catch (error: any) {
        console.error('获取文章失败:', error);
        setError('获取文章失败');
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError('标题和内容不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      await axios.put(`/api/articles/${id}`, payload);
      navigate('/admin/articles');
    } catch (error: any) {
      console.error('更新文章失败:', error);
      setError(error.response?.data?.message || '更新文章失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loadingArticle) {
    return <LoadingSpinner>正在加载文章...</LoadingSpinner>;
  }

  if (error && loadingArticle) {
    return (
      <>
        <ErrorMessage>{error}</ErrorMessage>
        <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
          <Button variant="outline">← 返回文章列表</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <PageTitle>编辑文章</PageTitle>
        <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
          <Button variant="outline">← 返回文章列表</Button>
        </Link>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ArticleEditor>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="输入文章标题"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="slug">URL别名</Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              placeholder="留空将自动生成"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="excerpt">摘要</Label>
            <Input
              id="excerpt"
              name="excerpt"
              type="text"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="文章摘要（留空将自动生成）"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="categories">分类</Label>
            <Input
              id="categories"
              name="categories"
              type="text"
              value={formData.categories}
              onChange={handleChange}
              placeholder="用逗号分隔多个分类，如：技术,前端"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="用逗号分隔多个标签，如：React,JavaScript"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">状态</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="content">内容 * (支持Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="使用Markdown语法编写文章内容..."
              required
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? '保存中...' : '保存修改'}
            </Button>
            <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
              <Button type="button" variant="outline">取消</Button>
            </Link>
          </div>
        </form>
      </ArticleEditor>
    </>
  );
};

export default AdminDashboard; 