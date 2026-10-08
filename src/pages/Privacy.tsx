import StaticPage from '../components/legal/StaticPage';

export const meta = () => [{ title: 'Privacy — 52lyrics' }, { name: 'description', content: 'How 52lyrics stores saved items and measures anonymous site performance.' }];

export default function Privacy() {
  return <StaticPage eyebrow="Privacy" title="Small footprint, plain language." intro="52lyrics does not require an account and does not sell personal information.">
    <h2>Saved items and recent activity</h2><p>Your saved library, recently viewed items, and recent searches are stored in localStorage in this browser under the key 52lyrics:library:v1. Homepage spotlight rotation stores previously featured artist IDs under 52lyrics:home-spotlights:v1 to vary the artists shown on future visits. These records do not sync to a server. Clearing browser storage removes them.</p>
    <h2>Anonymous analytics</h2><p>On Vercel deployments we use Vercel Web Analytics to understand aggregate page visits and Web Vitals. The release does not add advertising cookies or marketing profiles.</p>
    <h2>External links</h2><p>Links to third-party sites are governed by those sites’ privacy practices. 52lyrics does not embed third-party audio players.</p>
  </StaticPage>;
}
