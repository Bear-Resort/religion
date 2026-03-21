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
        "id": "Construction-of-time",
        "chapter": 1,
        "section": 1,
        "title": "Existence of the World",
        "category": "Foundations",
        "language": "English",
        "path": "Construction-of-time.md"
      },
      {
        "id": "Construction-of-space",
        "chapter": 1,
        "section": 2,
        "title": "Construction of Space",
        "category": "Foundations",
        "language": "English",
        "path": "Construction-of-space.md"
      }
    ]
  }
];
