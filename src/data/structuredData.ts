/** JSON embedded in an HTML script must not contain a literal closing-tag opener. */
export const serializeStructuredData = (value: Record<string, unknown>) =>
  JSON.stringify(value).replace(/</g, '\\u003c');
