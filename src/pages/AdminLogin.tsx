import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LoginTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
`;

const LoginSubtitle = styled.p`
  color: #6c757d;
  font-size: 1rem;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #212529;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007acc;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background-color: #007acc;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #dc3545;
  color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #28a745;
  color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
`;

const DefaultCredentials = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6c757d;

  h4 {
    margin: 0 0 0.5rem 0;
    color: #212529;
    font-size: 0.875rem;
  }

  p {
    margin: 0.25rem 0;
  }

  code {
    background-color: #e9ecef;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
  }
`;

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // 如果已经登录，重定向到管理后台
  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setSuccess(result.message);
        // 短暂显示成功消息后跳转
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@blog.com');
    setPassword('admin123');
  };

  return (
    <>
      <Helmet>
        <title>管理员登录 - 个人博客</title>
        <meta name="description" content="个人博客管理员登录页面" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <LoginContainer>
        <LoginCard>
          <LoginHeader>
            <LoginTitle>管理员登录</LoginTitle>
            <LoginSubtitle>请使用管理员账户登录</LoginSubtitle>
          </LoginHeader>

          <LoginForm onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <FormGroup>
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blog.com"
                disabled={loading}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                disabled={loading}
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </SubmitButton>
          </LoginForm>

          <DefaultCredentials>
            <h4>默认管理员账户</h4>
            <p>邮箱: <code>admin@blog.com</code></p>
            <p>密码: <code>admin123</code></p>
            <button 
              type="button" 
              onClick={handleQuickFill}
              style={{
                background: 'none',
                border: '1px solid #007acc',
                color: '#007acc',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                marginTop: '0.5rem'
              }}
            >
              快速填入
            </button>
          </DefaultCredentials>
        </LoginCard>
      </LoginContainer>
    </>
  );
};

export default AdminLogin; 