// Markdown 文件解析工具

export interface ArticleMetadata {
  title?: string;
  excerpt?: string;
  slug?: string;
  status?: string;
  categories?: string[];
  tags?: string[];
  date?: string;
  views?: number;
  author?: string;
}

export interface ParsedMarkdown {
  metadata: ArticleMetadata;
  content: string;
}

/**
 * 解析 Markdown 文件的 YAML front matter 和内容
 */
export function parseMarkdown(markdownText: string): ParsedMarkdown {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdownText.match(frontMatterRegex);

  if (!match) {
    // 如果没有 front matter，返回默认值
    return {
      metadata: {},
      content: markdownText
    };
  }

  const [, frontMatter, content] = match;
  const metadata = parseFrontMatter(frontMatter);

  return {
    metadata,
    content: content.trim()
  };
}

/**
 * 解析 YAML front matter
 */
function parseFrontMatter(frontMatter: string): ArticleMetadata {
  const metadata: ArticleMetadata = {};
  const lines = frontMatter.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue; // 跳过空行和注释
    }

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) {
      continue; // 跳过没有冒号的行
    }

    const key = trimmedLine.substring(0, colonIndex).trim();
    const value = trimmedLine.substring(colonIndex + 1).trim();

    // 解析不同类型的值
    switch (key) {
      case 'title':
      case 'excerpt':
      case 'slug':
      case 'status':
      case 'date':
      case 'author':
        metadata[key] = parseStringValue(value);
        break;
      case 'views':
        metadata[key] = parseNumberValue(value);
        break;
      case 'categories':
      case 'tags':
        metadata[key] = parseArrayValue(value);
        break;
    }
  }

  return metadata;
}

/**
 * 解析字符串值（去除引号）
 */
function parseStringValue(value: string): string {
  // 去除首尾的引号
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * 解析数字值
 */
function parseNumberValue(value: string): number {
  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * 解析数组值
 */
function parseArrayValue(value: string): string[] {
  // 移除方括号并按逗号分割
  const cleanValue = value.replace(/^\[|\]$/g, '').trim();
  if (!cleanValue) {
    return [];
  }
  
  return cleanValue
    .split(',')
    .map(item => {
      const trimmed = item.trim();
      // 去除每个项目的引号
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    })
    .filter(item => item.length > 0);
}

/**
 * 从文件路径加载并解析 Markdown 文件
 */
export async function loadMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
  try {
    const baseUrl = process.env.PUBLIC_URL || '';
    const fullPath = `${baseUrl}/articles/${filePath}`;
    
    console.log('🔗 Loading markdown file:', fullPath);
    
    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load markdown file: ${response.status} ${response.statusText}`);
    }
    
    const markdownText = await response.text();
    console.log('📄 Markdown loaded successfully, length:', markdownText.length);
    
    const parsed = parseMarkdown(markdownText);
    console.log('✅ Markdown parsed:', { 
      hasMetadata: Object.keys(parsed.metadata).length > 0,
      contentLength: parsed.content.length,
      title: parsed.metadata.title 
    });
    
    return parsed;
  } catch (error) {
    console.error('❌ Error loading markdown file:', error);
    throw error;
  }
}