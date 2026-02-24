// types/article.ts

export interface ImageFormat {
	ext: string
	url: string
	hash: string
	mime: string
	name: string
	path: string | null
	size: number
	width: number
	height: number
	sizeInBytes: number
  }
  
  export interface Image {
	id: number
	documentId: string
	name: string
	alternativeText: string | null
	caption: string | null
	width: number
	height: number
	formats: {
	  large?: ImageFormat
	  small?: ImageFormat
	  medium?: ImageFormat
	  thumbnail?: ImageFormat
	}
	hash: string
	ext: string
	mime: string
	size: number
	url: string
	previewUrl: string | null
	provider: string
	provider_metadata: null
	createdAt: string
	updatedAt: string
	publishedAt: string
	related?: ArticleRelated[]
  }
  
  export interface ArticleRelated {
	__type: string
	id: number
	documentId: string
	title: string
	description: string
	slug: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	locale: string
  }
  
  export interface Author {
	id: number
	documentId: string
	name: string
	email: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	avatar: Image
	articles: ArticleRelated[]
  }
  
  export interface Category {
	id: number
	documentId: string
	name: string
	slug: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	locale: string
  }


export const categoryIcons: Record<string, string> = {
  'css': 'i-mkt-css',
  'nodejs': 'i-mkt-nodedotjs',
  'web-dev': 'i-mkt-www',
  'medusajs': 'i-mkt-shopping-bag',
  'fastify': 'i-mkt-fastify',
  'frontend': 'i-mkt-round-monitor',
  'javascript': 'i-mkt-javascript',
  'nuxtjs': 'i-mkt-nuxt',
  'tailwindcss': 'i-mkt-tailwindcss',
  'typescript': 'i-mkt-typescript',
  'ui': 'i-mkt-palette-linear',
  'woocommerce': 'i-mkt-woocommerce',
  'wordpress': 'i-mkt-wordpress',
  'denalify': 'i-mkt-code-line',
  'adonisjs': 'i-mkt-adonisjs'
}

// Helper do pobierania ikony dla kategorii
export const getCategoryIcon = (slug: string): string => {
  return categoryIcons[slug] || 'i-lucide-tag'
}
  
  export interface Article {
	id: number
	documentId: string
	title: string
	description: string
	slug: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	locale: string
	cover: Image
	author: Author
	categories: Category[]
	localizations?: Array<{
		id: number
		slug: string
		locale: string
	}>
  }
  
  export interface ArticlesResponse {
	data: Article[]
	meta: {
	  pagination: {
		page: number
		pageSize: number
		pageCount: number
		total: number
	  }
	}
  }