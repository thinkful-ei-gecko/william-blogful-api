CREATE TYPE article_category as ENUM (
    'Listicle',
    'How-to',
    'News',
    'Interview',
    'Story'
);

ALTER TABLE blogful_articles
  ADD COLUMN
    style article_category;