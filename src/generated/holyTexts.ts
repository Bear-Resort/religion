export type HolySection = {
  id: string;
  chapter: number;
  section: number;
  title: string;
  category: string;
  language: string;
  path: string;
};

export type HolyChapter = {
  chapter: number;
  category: string;
  title: string;
  language: string;
  sections: HolySection[];
};

export const holyChapters: HolyChapter[] = [
  {
    "chapter": 1,
    "category": "Chapter",
    "title": "构造",
    "language": "Chinese",
    "sections": [
      {
        "id": "Construction",
        "chapter": 1,
        "section": 0,
        "title": "Constructions",
        "category": "Chapter",
        "language": "English",
        "path": "Construction.md"
      },
      {
        "id": "构造",
        "chapter": 1,
        "section": 0,
        "title": "构造",
        "category": "Chapter",
        "language": "Chinese",
        "path": "构造.md"
      },
      {
        "id": "existence-of-the-world",
        "chapter": 1,
        "section": 1,
        "title": "Existence of the World",
        "category": "Foundations",
        "language": "English",
        "path": "existence-of-the-world.md"
      },
      {
        "id": "construction-of-the-space",
        "chapter": 1,
        "section": 2,
        "title": "Construction of the Space",
        "category": "Foundations",
        "language": "English",
        "path": "construction-of-the-space.md"
      }
    ]
  }
];
