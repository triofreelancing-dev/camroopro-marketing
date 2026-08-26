export type LegalBlock = {
  /** `title` = document title, `heading` = numbered section, `body` = prose. */
  kind: 'title' | 'heading' | 'body';
  text: string;
};
