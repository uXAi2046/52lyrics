import type { ImageCredit, MetadataSource } from '../../types';

export function PhotoCredit({ credit }: { credit?: ImageCredit }) {
  if (!credit) return null;
  return <p className="source-credit">Photo: <a href={credit.sourceUrl} target="_blank" rel="noreferrer">{credit.attribution || credit.author}</a> · <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a>. Displayed with a responsive crop.</p>;
}

export function MetadataCredit({ source }: { source?: MetadataSource }) {
  if (!source) return null;
  return <div className="source-credit">
    {source.edition && <p>Source edition: {source.edition}</p>}
    <p>{source.provider === 'Wikidata' ? 'Artist profile' : 'Release data'}: <a href={source.url} target="_blank" rel="noreferrer">{source.provider}</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">{source.license}</a> · Retrieved {source.retrievedAt}.</p>
  </div>;
}
