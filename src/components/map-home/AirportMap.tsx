import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HomeMapPin } from '../../repositories/homeMapRepository';
import { cn } from '../../utils/cn';

const DEFAULT_CENTER: L.LatLngExpression = [37.4585, 126.443];
const DEFAULT_ZOOM = 13;

function pinHtml(pin: HomeMapPin, selected: boolean): string {
  const color =
    pin.kind === 'pickup' ? '#3182f6' : pin.kind === 'service' ? '#1b64da' : '#0f766e';
  const ring = selected ? 'box-shadow:0 0 0 3px rgba(49,130,246,0.35);' : '';
  return `<div style="
    background:${color};
    color:#fff;
    font:700 11px/1.2 Pretendard,system-ui,sans-serif;
    padding:6px 10px;
    border-radius:999px;
    white-space:nowrap;
    border:2px solid #fff;
    ${ring}
  ">${pin.label}</div>`;
}

export default function AirportMap({
  pins,
  selectedPinId,
  onSelectPin,
  className,
}: {
  pins: HomeMapPin[];
  selectedPinId?: string | null;
  onSelectPin?: (pinId: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const pinKey = useMemo(
    () => pins.map((p) => `${p.id}:${p.lat}:${p.lng}`).join('|'),
    [pins]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (pins.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds([]);
    for (const pin of pins) {
      const icon = L.divIcon({
        className: 'airpick-map-pin',
        html: pinHtml(pin, pin.id === selectedPinId),
        iconSize: [1, 1],
        iconAnchor: [0, 12],
      });
      const marker = L.marker([pin.lat, pin.lng], { icon });
      marker.on('click', () => onSelectPin?.(pin.id));
      marker.addTo(layer);
      bounds.extend([pin.lat, pin.lng]);
    }

    if (pins.length === 1) {
      map.setView([pins[0]!.lat, pins[0]!.lng], 14);
    } else {
      map.fitBounds(bounds.pad(0.35));
    }
    map.invalidateSize();
  }, [pinKey, selectedPinId, onSelectPin, pins]);

  return (
    <div
      ref={containerRef}
      className={cn('h-full w-full bg-sky-tint [&_.leaflet-control-attribution]:text-[10px]', className)}
      role="presentation"
    />
  );
}
