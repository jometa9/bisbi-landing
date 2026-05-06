export interface DocSection {
  id: string;
  title: string;
  description: string;
  category: string;
  file: string;
  order: number;
  content?: string;
}

export interface DocCategory {
  id: string;
  name: string;
  description: string;
}

export interface DocsConfig {
  title: string;
  description: string;
  sections: DocSection[];
  categories: DocCategory[];
}
