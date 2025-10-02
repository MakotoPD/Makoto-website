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
  'css': 'i-simple-icons-css',
  'nodejs': 'i-simple-icons-nodedotjs',
  'web-dev': 'i-solar-global-linear',
  'medusajs': 'i-solar-bag-5-bold-duotone',
  'fastify': 'i-simple-icons-fastify',
  'frontend': 'i-solar-monitor-bold-duotone',
  'javascript': 'i-simple-icons-javascript',
  'nuxtjs': 'i-simple-icons-nuxt',
  'tailwindcss': 'i-simple-icons-tailwindcss',
  'typescript': 'i-simple-icons-typescript',
  'ui': 'i-solar-palette-bold-duotone',
  'woocommerce': 'i-simple-icons-woocommerce',
  'wordpress': 'i-simple-icons-wordpress'
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