import StaticPage from '../components/legal/StaticPage';

export const meta = () => [{ title: 'Terms — 52lyrics' }, { name: 'description', content: 'Basic terms for using the public 52lyrics catalog.' }];

export default function Terms() {
  return <StaticPage eyebrow="Terms" title="Use the catalog thoughtfully." intro="By using 52lyrics, you agree to use the site for personal browsing and reading.">
    <h2>Catalog information</h2><p>Release dates, credits, and editorial descriptions are provided for discovery and may be corrected as the catalog evolves. They are not a substitute for an official label or rights database.</p>
    <h2>Original content</h2><p>Original lyrics, interface copy, and custom visual assets may not be republished as a competing catalog without permission. Personal quotation and linking are welcome where applicable law allows.</p>
    <h2>Availability</h2><p>The service is provided without a promise of uninterrupted availability. Features may change to improve reliability, accessibility, or rights compliance.</p>
  </StaticPage>;
}
