---
title: "React Hooks 完全指南"
excerpt: "深入了解 React Hooks 的使用方法和最佳实践，从基础到高级用法。"
slug: "react-hooks-guide"
status: "published"
categories: ["技术", "前端"]
tags: ["React", "Hooks", "JavaScript", "前端开发"]
date: "2024-01-10"
views: 256
author: "博主"
---

# React Hooks 完全指南

React Hooks 是 React 16.8 引入的重要特性，让我们能够在函数组件中使用状态和其他 React 特性。

## 基础 Hooks

### useState
`useState` 是最常用的 Hook，用于在函数组件中添加状态：

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

### useEffect
`useEffect` 用于处理副作用，如数据获取、订阅或 DOM 操作：

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // 依赖数组

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 高级 Hooks

### useContext
用于消费 React Context：

```javascript
const ThemeContext = React.createContext();

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background }}>
      我是主题按钮
    </button>
  );
}
```

### useReducer
用于管理复杂状态逻辑：

```javascript
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'reset' })}>
        重置
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        -
      </button>
      <button onClick={() => dispatch({ type: 'increment' })}>
        +
      </button>
    </>
  );
}
```

## 自定义 Hooks

自定义 Hooks 让我们能够重用状态逻辑：

```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 使用自定义 Hook
function PostList() {
  const { data: posts, loading, error } = useFetch('/api/posts');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 最佳实践

1. **只在顶层调用 Hooks** - 不要在循环、条件或嵌套函数中调用 Hooks
2. **使用依赖数组** - 正确设置 useEffect 的依赖数组
3. **避免无限循环** - 小心处理对象和数组依赖
4. **自定义 Hooks 复用逻辑** - 提取重复的状态逻辑到自定义 Hooks

React Hooks 让函数组件变得更加强大和灵活，是现代 React 开发的核心！