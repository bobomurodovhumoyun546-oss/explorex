import { useMemo } from 'react';
import { Marker } from 'react-simple-maps';
import { geoContains } from 'd3-geo';
import { findMapCountry } from '../data/countryDetails';
import { territoryFlagPosition } from '../data/atlasFlagMarkers';

const positions = new WeakMap();

export default function WorldMapFlags({ geographies, countries, zoom, onSelect, displayName }) {
  const anchors = useMemo(() => geographies.flatMap(geo => {
    const country = findMapCountry(countries, geo);
    if (!country) return [];
    if (!positions.has(geo.geometry)) positions.set(geo.geometry, territoryFlagPosition(geo));
    const capital = country.capitalInfo?.latlng;
    const capitalPoint = capital?.length === 2 ? [capital[1], capital[0]] : null;
    const coordinates = capitalPoint && geoContains(geo, capitalPoint) ? capitalPoint : positions.get(geo.geometry);
    return coordinates ? [{ geo, coordinates, country }] : [];
  }), [geographies, countries]);
  const flagWidth = Math.min(26, 14 + zoom * 3);
  const flagHeight = flagWidth * 2 / 3;

  return anchors.map(({geo, coordinates, country}) => {
    const src = country.flags?.svg || country.flags?.png;
    if (!src) return null;
    const name = displayName(country);
    function choose() { onSelect(country); }
    return <Marker key={geo.rsmKey} coordinates={coordinates}>
      <g transform={`scale(${1 / zoom})`} role="button" tabIndex={0} aria-label={`${name} bayrog‘i`} onClick={choose} onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
      }} className="cursor-pointer">
        <title>{name}</title>
        <rect x={-flagWidth/2} y={-flagHeight/2} width={flagWidth} height={flagHeight} rx={2} fill="white" stroke="#334155" strokeWidth={.8} />
        <image href={src} x={-flagWidth/2+1} y={-flagHeight/2+1} width={flagWidth-2} height={flagHeight-2} preserveAspectRatio="xMidYMid meet" />
      </g>
    </Marker>;
  });
}
