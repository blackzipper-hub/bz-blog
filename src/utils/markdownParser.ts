// Markdown文件解析器
export interface ArticleMetadata {
  title: string;
  excerpt: string;
  slug: string;
  status: string;
  categories: string[];
  tags: string[];
  date: string;
  views: number;
  author: string;
}

export interface ParsedArticle extends ArticleMetadata {
  id: number;
  content: string;
}

/**
 * 解析YAML Front Matter
 */
export function parseFrontMatter(markdownContent: string): {
  metadata: Partial<ArticleMetadata>;
  content: string;
} {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdownContent.match(frontMatterRegex);

  if (!match) {
    return {
      metadata: {},
      content: markdownContent
    };
  }

  const frontMatterContent = match[1];
  const content = match[2];
  const metadata: Partial<ArticleMetadata> = {};

  // 简单的YAML解析（仅支持基本格式）
  const lines = frontMatterContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).trim();
    let value = trimmedLine.substring(colonIndex + 1).trim();

    // 处理引号包围的值
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    // 处理数组格式 [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      const items = arrayContent.split(',').map(item => {
        let trimmed = item.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          trimmed = trimmed.slice(1, -1);
        } else if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
          trimmed = trimmed.slice(1, -1);
        }
        return trimmed;
      }).filter(item => item.length > 0);
      
      (metadata as any)[key] = items;
    } else if (key === 'views') {
      // 处理数字类型
      (metadata as any)[key] = parseInt(value, 10) || 0;
    } else {
      // 普通字符串值
      (metadata as any)[key] = value;
    }
  }

  return {
    metadata,
    content: content.trim()
  };
}

/**
 * 验证文章元数据
 */
export function validateArticleMetadata(metadata: Partial<ArticleMetadata>): ArticleMetadata {
  return {
    title: metadata.title || '无标题',
    excerpt: metadata.excerpt || '',
    slug: metadata.slug || 'untitled',
    status: metadata.status || 'draft',
    categories: metadata.categories || [],
    tags: metadata.tags || [],
    date: metadata.date || new Date().toISOString().split('T')[0],
    views: metadata.views || 0,
    author: metadata.author || '匿名'
  };
}

/**
 * 从Markdown文件内容解析完整文章
 */
export function parseMarkdownArticle(
  markdownContent: string, 
  id: number
): ParsedArticle {
  const { metadata, content } = parseFrontMatter(markdownContent);
  const validatedMetadata = validateArticleMetadata(metadata);
  
  return {
    id,
    ...validatedMetadata,
    content
  };
}