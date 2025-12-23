import React from 'react';

export interface NewsArticle {
  id: string;
  slug?: string; // URL-friendly identifier, e.g., "claude-daily-2025-12-23"
  title: string;
  summary: string;
  content: string; // Full content for AI summarization
  imageUrl: string;
  category: Category;
  date: string;
  author: string;
  tags: string[];
}

export enum Category {
  ALL = 'All',
  GEMINI = 'Gemini',
  GPT = 'GPT',
  CLAUDE = 'Claude',
  GROK = 'Grok',
  QWEN = 'Qwen',
  MISTRAL = 'Mistral',
  EVALUATION = 'Evaluation'
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  category: Category;
}