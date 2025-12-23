/**
 * Markdown to Constants Converter
 * 
 * This script reads markdown files from ../content/_posts/ directory
 * and generates the constants.ts file for the React app.
 * 
 * Usage: node scripts/generate-articles.js
 * 
 * This allows n8n to simply push markdown files to the repo,
 * and the GitHub Actions workflow will automatically convert them.
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', '..', 'content', '_posts');
const IMAGES_DIR = path.join(__dirname, '..', '..', 'content', 'assets', 'img', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'articles.ts');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Category mapping from markdown model to React Category enum
const CATEGORY_MAP = {
    'claude': 'Category.CLAUDE',
    'gemini': 'Category.GEMINI',
    'gpt': 'Category.GPT',
    'grok': 'Category.GROK',
    'qwen': 'Category.QWEN',
    'mistral': 'Category.MISTRAL',
    'general': 'Category.EVALUATION',
    'evaluation': 'Category.EVALUATION'
};

// Default images for categories without custom images
const DEFAULT_IMAGES = {
    'claude': 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
    'gemini': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    'gpt': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    'grok': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    'qwen': 'https://images.unsplash.com/photo-1529948694602-83788d7455f0?auto=format&fit=crop&w=800&q=80',
    'mistral': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    'general': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'evaluation': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
};

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) return { frontmatter: {}, body: content };

    const frontmatterStr = match[1];
    const body = content.slice(match[0].length).trim();

    const frontmatter = {};
    frontmatterStr.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // Handle arrays like [tag1, tag2]
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim());
            }
            frontmatter[key] = value;
        }
    });

    return { frontmatter, body };
}

/**
 * Format date from YYYY-MM-DD to readable format
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Extract summary from markdown body (first paragraph or tagline)
 */
function extractSummary(frontmatter, body) {
    if (frontmatter.tagline) {
        return frontmatter.tagline;
    }

    // Get first meaningful paragraph
    const paragraphs = body.split('\n\n').filter(p =>
        p.trim() && !p.startsWith('#') && !p.startsWith('---')
    );

    if (paragraphs.length > 0) {
        let summary = paragraphs[0].replace(/\n/g, ' ').trim();
        if (summary.length > 200) {
            summary = summary.slice(0, 197) + '...';
        }
        return summary;
    }

    return '閱讀更多...';
}

/**
 * Get image URL for an article
 */
function getImageUrl(frontmatter, filename) {
    const model = frontmatter.model || 'general';

    // Check if there's a matching infographic in the images directory
    const baseName = filename.replace('.md', '');
    const possibleImages = [
        `${baseName.replace('-daily', '-infographic')}.png`,
        `${baseName}-infographic.png`
    ];

    for (const imgName of possibleImages) {
        const imgPath = path.join(IMAGES_DIR, imgName);
        if (fs.existsSync(imgPath)) {
            return `/ai-nexus/images/${imgName}`;
        }
    }

    // Check frontmatter image
    if (frontmatter.image) {
        const imgName = path.basename(frontmatter.image);
        if (fs.existsSync(path.join(IMAGES_DIR, imgName))) {
            return `/ai-nexus/images/${imgName}`;
        }
    }

    // Use default image for category
    return DEFAULT_IMAGES[model.toLowerCase()] || DEFAULT_IMAGES['general'];
}

/**
 * Generate URL-friendly slug from markdown filename
 * e.g., "2025-12-23-claude-daily.md" -> "claude-daily-2025-12-23"
 */
function generateSlug(filename) {
    // Remove .md extension
    const baseName = filename.replace('.md', '');
    // Match pattern: YYYY-MM-DD-rest-of-name
    const match = baseName.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (match) {
        const [, date, name] = match;
        // Put the name first, then the date for better readability
        return `${name}-${date}`;
    }
    // Fallback: just use the base name
    return baseName;
}

/**
 * Copy images from content/assets/img/posts to frontend/public/images
 */
function copyImages() {
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
        fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    }

    if (!fs.existsSync(IMAGES_DIR)) {
        console.log('No images directory found at', IMAGES_DIR);
        return;
    }

    const images = fs.readdirSync(IMAGES_DIR).filter(f =>
        /\.(png|jpg|jpeg|gif|webp)$/i.test(f)
    );

    images.forEach(img => {
        const src = path.join(IMAGES_DIR, img);
        const dest = path.join(PUBLIC_IMAGES_DIR, img);
        fs.copyFileSync(src, dest);
        console.log(`Copied: ${img}`);
    });

    console.log(`Copied ${images.length} images`);
}

/**
 * Main function to generate constants.ts
 */
function generateConstants() {
    console.log('Reading markdown files from:', POSTS_DIR);

    if (!fs.existsSync(POSTS_DIR)) {
        console.error('Posts directory not found:', POSTS_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse(); // Newest first

    console.log(`Found ${files.length} markdown files`);

    const articles = [];

    files.forEach((file, index) => {
        const filePath = path.join(POSTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);

        const model = frontmatter.model || 'general';
        const category = CATEGORY_MAP[model.toLowerCase()] || 'Category.EVALUATION';

        const article = {
            id: String(index + 1),
            slug: generateSlug(file),
            title: frontmatter.title || file.replace('.md', ''),
            summary: extractSummary(frontmatter, body),
            content: body.slice(0, 2000), // Limit content length
            imageUrl: getImageUrl(frontmatter, file),
            category: category,
            date: formatDate(frontmatter.date || file.slice(0, 10)),
            author: 'AI News Bot',
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags :
                (frontmatter.tags ? [frontmatter.tags] : [model.toUpperCase(), 'AI', 'Digest'])
        };

        articles.push(article);
        console.log(`Processed: ${file} -> ${article.slug}`);
    });

    // Generate TypeScript content
    const tsContent = `import { Category, NewsArticle } from './types';

export const APP_NAME = "AI Nexus";

// Auto-generated from markdown files in content/_posts/
// Generated at: ${new Date().toISOString()}
// To regenerate: node scripts/generate-articles.js

export const MOCK_NEWS: NewsArticle[] = [
${articles.map(article => `  {
    id: '${article.id}',
    slug: '${article.slug}',
    title: ${JSON.stringify(article.title)},
    summary: ${JSON.stringify(article.summary)},
    content: ${JSON.stringify(article.content)},
    imageUrl: ${JSON.stringify(article.imageUrl)},
    category: ${article.category},
    date: '${article.date}',
    author: '${article.author}',
    tags: ${JSON.stringify(article.tags)}
  }`).join(',\n')}
];
`;

    fs.writeFileSync(OUTPUT_FILE, tsContent);
    console.log(`\nGenerated: ${OUTPUT_FILE}`);
    console.log(`Total articles: ${articles.length}`);
}

// Run the script
console.log('=== Markdown to Constants Converter ===\n');
copyImages();
console.log('');
generateConstants();
console.log('\n=== Done! ===');
