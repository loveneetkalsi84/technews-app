import mongoose, { Schema, Document, Model } from 'mongoose';

// Article Schema
export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string | Schema.Types.ObjectId;
  category: string | Schema.Types.ObjectId;
  tags: string[];
  metaDescription: string;
  metaKeywords: string[];
  seoScore: number;
  isAIGenerated: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  sourceType: 'ai' | 'rss' | 'manual' | 'scraped';
  sourceUrl?: string;
}

// Type for scraped product data
export interface ScrapedProduct {
  name?: string;
  brand?: string;
  price?: string;
  currency?: string;
  description?: string;
  imageUrl?: string;
  specs: Record<string, string>;
  features: string[];
  ratingValue?: number;
  ratingCount?: number;
  availability: 'InStock' | 'OutOfStock' | 'Unknown';
  sourceId?: string;
  productUrl?: string;
}

const ArticleSchema: Schema = new Schema(
  {    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: "" }, // Make it optional with default
    coverImage: { type: String, default: "https://via.placeholder.com/1200x630?text=Default+Image" }, // Make it optional with default
    author: { 
      type: Schema.Types.Mixed, // Allow both ObjectId and String
      ref: 'User',
      required: false, // Make it optional
      default: "admin"
    },
    category: { 
      type: Schema.Types.Mixed, // Allow both ObjectId and String
      ref: 'Category',
      required: false 
    },
    tags: [{ type: String, trim: true }],
    metaDescription: { type: String, trim: true },
    metaKeywords: [{ type: String, trim: true }],
    seoScore: { type: Number, default: 0 },
    isAIGenerated: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    sourceType: { 
      type: String, 
      enum: ['ai', 'rss', 'manual', 'scraped'],
      default: 'manual' 
    },
    sourceUrl: { type: String },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Create a text index on title and content for text search
ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'editor';
  image?: string;
  emailVerified?: Date;
  subscribed: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
  };
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'editor'],
      default: 'user' 
    },
    image: { type: String },
    emailVerified: { type: Date },
    subscribed: { type: Boolean, default: false },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    }
  },
  { timestamps: true }
);

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image?: string;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

// Comment Schema
export interface IComment extends Document {
  article: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  content: string;
  likes: number;
  replies: Array<{
    user: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
}

const CommentSchema: Schema = new Schema(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// SEO Analytics Schema
export interface ISEOAnalytics extends Document {
  article: Schema.Types.ObjectId;
  keywordDensity: {
    [key: string]: number;
  };
  keywordRank: {
    [key: string]: number;
  };
  backlinks: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

const SEOAnalyticsSchema: Schema = new Schema(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    keywordDensity: { type: Map, of: Number },
    keywordRank: { type: Map, of: Number },
    backlinks: { type: Number, default: 0 },
    averageTimeOnPage: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Source Schema (for RSS feeds)
export interface ISource extends Document {
  name: string;
  url: string;
  type?: string;
  category: Schema.Types.ObjectId;
  isActive: boolean;
  lastFetched?: Date;
  fetchFrequency: number; // in minutes
  scrapingConfig?: any; // Configuration for web scraping
}

const SourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    type: { type: String, enum: ['rss', 'scrape'], default: 'rss' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    lastFetched: { type: Date },
    fetchFrequency: { type: Number, default: 60 }, // Default to 1 hour
    scrapingConfig: { type: Schema.Types.Mixed }, // Configuration for web scraping
  },
  { timestamps: true }
);

// Product Schema (for product reviews and comparisons)
export interface IProduct extends Document {
  name: string;
  brand: string;
  price: string;
  currency: string;
  description: string;
  imageUrl: string;
  specs: Record<string, string>;
  features: string[];
  ratingValue?: number;
  ratingCount?: number;
  availability: 'InStock' | 'OutOfStock' | 'Unknown';
  sourceUrl: string;
  categories: string[];
  updatedAt: Date;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String },
    price: { type: String },
    currency: { type: String, default: 'USD' },
    description: { type: String },
    imageUrl: { type: String },
    specs: { type: Map, of: String },
    features: [{ type: String }],
    ratingValue: { type: Number },
    ratingCount: { type: Number },
    availability: { 
      type: String, 
      enum: ['InStock', 'OutOfStock', 'Unknown'],
      default: 'Unknown'
    },
    sourceUrl: { type: String },
    categories: [{ type: String }],
  },
  { timestamps: true }
);

// Tag Schema
export interface ITag extends Document {
  name: string;
  slug: string;
  articleCount: number;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    articleCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Scheduled Task Schema
export interface IScheduledTask extends Document {
  name: string;
  type: 'rss' | 'scraping' | 'scrape' | 'ai' | 'ai-generate' | 'maintenance';
  frequency: number; // in minutes
  lastRun?: Date;
  isEnabled: boolean;
  isActive: boolean;
  settings: Record<string, any>;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledTaskSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['rss', 'scraping', 'scrape', 'ai', 'ai-generate', 'maintenance'],
      required: true
    },
    frequency: { type: Number, default: 1440 }, // Default to daily
    lastRun: { type: Date },
    isEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    settings: { type: Schema.Types.Mixed, default: {} },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Export Models

// These need to be lazily loaded because NextJS serializes loaded models between the client and server
let Article: Model<IArticle>;
let User: Model<IUser>;
let Category: Model<ICategory>;
let Comment: Model<IComment>;
let SEOAnalytics: Model<ISEOAnalytics>;
let Source: Model<ISource>;
let Product: Model<IProduct>;
let Tag: Model<ITag>;
let ScheduledTask: Model<IScheduledTask>;

try {
  // Try to get existing models
  Article = mongoose.model<IArticle>('Article');
  User = mongoose.model<IUser>('User');
  Category = mongoose.model<ICategory>('Category');
  Comment = mongoose.model<IComment>('Comment');
  SEOAnalytics = mongoose.model<ISEOAnalytics>('SEOAnalytics');
  Source = mongoose.model<ISource>('Source');
  Product = mongoose.model<IProduct>('Product');
  Tag = mongoose.model<ITag>('Tag');
  ScheduledTask = mongoose.model<IScheduledTask>('ScheduledTask');
} catch {
  // Models don't exist, create them
  Article = mongoose.model<IArticle>('Article', ArticleSchema);
  User = mongoose.model<IUser>('User', UserSchema);
  Category = mongoose.model<ICategory>('Category', CategorySchema);
  Comment = mongoose.model<IComment>('Comment', CommentSchema);
  SEOAnalytics = mongoose.model<ISEOAnalytics>('SEOAnalytics', SEOAnalyticsSchema);
  Source = mongoose.model<ISource>('Source', SourceSchema);
  Product = mongoose.model<IProduct>('Product', ProductSchema);
  Tag = mongoose.model<ITag>('Tag', TagSchema);
  ScheduledTask = mongoose.model<IScheduledTask>('ScheduledTask', ScheduledTaskSchema);
}

export { 
  Article, 
  User, 
  Category, 
  Comment, 
  SEOAnalytics,
  Source,
  Product,
  Tag,
  ScheduledTask
};
