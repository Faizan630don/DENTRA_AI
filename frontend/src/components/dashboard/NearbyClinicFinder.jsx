/**
 * NearbyClinicFinder.jsx
 * 
 * Finds REAL nearby dental clinics using:
 *   • Nominatim reverse geocoding — 100% free, no API key
 */
 
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Star, IndianRupee, Navigation, ExternalLink,
  Loader2, AlertCircle, Trophy, TrendingDown, BadgeCheck,
  ChevronRight, Phone, Clock, RefreshCw,
} from 'lucide-react';
 
// ─── Pricing Dictionary ───────────────────────────────────────────────────────
 
const CONDITION_PRICES = {
  'Cavity':                   { min: 1000,  max: 2500,  label: 'Composite Filling' },
  'Caries':                   { min: 1000,  max: 2500,  label: 'Composite Filling' },
  'Root Infection':            { min: 4000,  max: 8000,  label: 'Root Canal Treatment' },
  'Root Canal':               { min: 4000,  max: 8000,  label: 'Root Canal Treatment' },
  'Fractured Crown':          { min: 5000,  max: 8000,  label: 'Ceramic Crown' },
  'Crown':                    { min: 5000,  max: 8000,  label: 'Ceramic Crown' },
  'Impacted Wisdom Tooth':    { min: 5000,  max: 12000, label: 'Surgical Extraction' },
  'Bone Loss':                { min: 10000, max: 30000, label: 'Periodontal Treatment' },
  'Periapical Shadow':        { min: 5000,  max: 10000, label: 'Periapical Treatment' },
  'Old Filling Failure':      { min: 1500,  max: 3000,  label: 'Calculus Removal + Refill' },
  'Calculus':                 { min: 1500,  max: 3000,  label: 'Scaling & Polishing' },
  'Missing Tooth':            { min: 25000, max: 60000, label: 'Dental Implant' },
  'Malaligned':               { min: 30000, max: 50000, label: 'Orthodontic Treatment' },
  'Sinus Lift':               { min: 15000, max: 40000, label: 'Sinus Augmentation' },
  'Unknown':                  { min: 2000,  max: 5000,  label: 'Consultation + Treatment' },
};
 
function getPriceRange(condition) {
  return CONDITION_PRICES[condition]
    ?? Object.entries(CONDITION_PRICES).find(([k]) =>
        condition.toLowerCase().includes(k.toLowerCase())
      )?.[1]
    ?? CONDITION_PRICES['Unknown'];
}
 
// ─── Distance helper ──────────────────────────────────────────────────────────
 
function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
 
// ─── Simulated rating from clinic distance + name hash ────────────────────────
function simulateRating(clinic, distKm) {
  const nameLen = (clinic.tags.name ?? '').length;
  const seed = (clinic.id % 100) / 100;
  const base = 3.8 + seed * 0.9;
  const proximityBonus = Math.max(0, (3 - distKm) * 0.05);
  const nameBonus = Math.min(0.15, nameLen * 0.005);
  return Math.min(5.0, parseFloat((base + proximityBonus + nameBonus).toFixed(1)));
}
 
// ─── Multiplier logic ───────────────────────────────────────────────────
function getMultiplier(rating) {
  if (rating >= 4.8) return { mult: 1.3, label: 'Premium' };
  if (rating >= 4.5) return { mult: 1.1, label: 'Trusted' };
  return { mult: 0.9, label: 'Best Value' };
}
 
// ─── Overpass API ─────────────────────────────────────────────────────────────
async function fetchNearbyClinics(coords) {
  const { lat, lng } = coords;
  const radius = 5000;
 
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="dentist"](around:${radius},${lat},${lng});
      node["healthcare"="dentist"](around:${radius},${lat},${lng});
      node["name"~"[Dd]ental|[Dd]entist|[Cc]linic",i]["amenity"~"clinic|dentist",i](around:${radius},${lat},${lng});
    );
    out body;
  `;
 
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
 
  if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
  const data = await response.json();
  return (data.elements ?? []).filter((e) => e.tags?.name);
}
 
// ─── Reverse geocode user location ───────────────────────────────────────────
async function reverseGeocode(coords) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.address?.suburb ?? data.address?.city ?? data.address?.county ?? 'your area';
  } catch {
    return 'your area';
  }
}
 
function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}
 
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, rating - (s - 1)));
        return (
          <span key={s} className="relative text-base leading-none w-4">
            <Star className="w-4 h-4 text-slate-600" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </span>
          </span>
        );
      })}
      <span className="text-xs font-semibold text-amber-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}
 
// Leaflet Map Component
function ClinicMap({
  userCoords,
  clinics,
  activeId,
  onMarkerClick,
}) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
 
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
 
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
 
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;
 
      const map = L.map(mapRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 14,
        zoomControl: true,
      });
 
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
 
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#0EA5E9;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(14,165,233,0.3)"></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>You are here</strong>');
 
      clinics.forEach((clinic, i) => {
        const colors = ['#EF4444', '#F59E0B', '#22C55E'];
        const color = colors[i] ?? '#6B7280';
        const icon = L.divIcon({
          html: `
            <div style="
              width:32px;height:32px;
              background:${color};
              border:3px solid white;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              box-shadow:0 2px 8px rgba(0,0,0,0.4);
              display:flex;align-items:center;justify-content:center;
            ">
              <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:12px">${i + 1}</span>
            </div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
 
        const marker = L.marker([clinic.lat, clinic.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <strong style="font-size:13px">${clinic.name}</strong><br/>
              <span style="color:#6B7280;font-size:11px">${clinic.address}</span><br/>
              <span style="color:#0EA5E9;font-weight:600;font-size:12px;margin-top:4px;display:block">
                ${formatINR(clinic.adjustedMin)} – ${formatINR(clinic.adjustedMax)}
              </span>
              ${clinic.isGreatValue ? '<span style="background:#D1FAE5;color:#065F46;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600">Great Value</span>' : ''}
            </div>
          `)
          .on('click', () => onMarkerClick(clinic.id));
 
        markersRef.current.push({ id: clinic.id, marker });
      });
 
      leafletMapRef.current = map;
    };
    document.head.appendChild(script);
 
    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, [userCoords, clinics, onMarkerClick]);
 
  useEffect(() => {
    if (!leafletMapRef.current || !activeId) return;
    const entry = markersRef.current.find(m => m.id === activeId);
    if (entry) {
      const clinic = clinics.find(c => c.id === activeId);
      if (clinic) {
        leafletMapRef.current.flyTo([clinic.lat, clinic.lng], 16, { duration: 0.8 });
        entry.marker.openPopup();
      }
    }
  }, [activeId, clinics]);
 
  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{
        height: '320px',
        background: '#1E293B',
        border: '1px solid #334155',
      }}
    />
  );
}
 
function RankBadge({ rank }) {
  const configs = [
    { icon: <Trophy className="w-3.5 h-3.5" />, label: '#1 Best', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400' },
    { icon: <Star className="w-3.5 h-3.5" />, label: '#2 Pick', bg: 'bg-sky-500/20 border-sky-500/40 text-sky-400' },
    { icon: <BadgeCheck className="w-3.5 h-3.5" />, label: '#3 Choice', bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' },
  ];
  const cfg = configs[rank] ?? configs[2];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}
 
const FALLBACK = { lat: 12.9716, lng: 77.5946 };

export default function NearbyClinicFinder({ condition }) {
  const [state, setState] = useState('idle');
  const [userCoords, setUserCoords] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [clinics, setClinics] = useState([]);
  const [baseRange, setBaseRange] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeClinicId, setActiveClinicId] = useState(null);
  const [showMap, setShowMap] = useState(true);
 
  const buildClinics = useCallback(
    (raw, coords, priceRange) => {
      return raw
        .filter(c => c.lat && c.lon)
        .map((c) => {
          const distKm = haversine(coords, c);
          const rating = simulateRating(c, distKm);
          const { mult, label } = getMultiplier(rating);
          const adjMin = Math.round(priceRange.min * mult);
          const adjMax = Math.round(priceRange.max * mult);
          const valueScore = (rating ** 2) / adjMax;
          const address = [
            c.tags['addr:street'],
            c.tags['addr:full'],
            c.tags['addr:city'],
          ].filter(Boolean).join(', ') || `${distKm.toFixed(1)} km away`;
 
          return {
            id: c.id,
            name: c.tags.name ?? 'Dental Clinic',
            lat: c.lat,
            lng: c.lon,
            address,
            phone: c.tags.phone,
            hours: c.tags.opening_hours,
            distanceKm: distKm,
            simulatedRating: rating,
            adjustedMin: adjMin,
            adjustedMax: adjMax,
            valueScore,
            isGreatValue: adjMax < priceRange.max,
            multiplierLabel: label,
            osmUrl: `https://www.openstreetmap.org/node/${c.id}`,
            mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(c.tags.name ?? 'dental clinic')}&ll=${c.lat},${c.lon}`,
          };
        })
        .sort((a, b) => b.valueScore - a.valueScore)
        .slice(0, 3);
    },
    []
  );
 
  const run = useCallback(async (coords) => {
    const priceRange = getPriceRange(condition);
    setBaseRange(priceRange);
    setState('fetching');
 
    try {
      const [rawClinics, area] = await Promise.all([
        fetchNearbyClinics(coords),
        reverseGeocode(coords),
      ]);
      setAreaName(area);
 
      if (!rawClinics.length) {
        setErrorMsg(`No dental clinics found within 5 km of your location. Try a different area.`);
        setState('error');
        return;
      }
 
      const processed = buildClinics(rawClinics, coords, priceRange);
      if (!processed.length) {
        setErrorMsg('Clinics found but could not process location data.');
        setState('error');
        return;
      }
 
      setClinics(processed);
      setActiveClinicId(processed[0].id);
      setState('done');
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not fetch nearby clinics. Please check your connection and try again.');
      setState('error');
    }
  }, [condition, buildClinics]);
 
  const locate = useCallback(() => {
    setState('locating');
    if (!navigator.geolocation) {
      setUserCoords(FALLBACK);
      run(FALLBACK);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        run(coords);
      },
      () => {
        setUserCoords(FALLBACK);
        run(FALLBACK);
      },
      { timeout: 8000 }
    );
  }, [run]);
 
  if (state === 'idle') {
    const pr = getPriceRange(condition);
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Find Nearby Dental Clinics</h3>
            <p className="text-xs text-slate-400">Real clinics · Live map · Cost estimates</p>
          </div>
        </div>
 
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <IndianRupee className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-1">Market rate for <span className="text-white font-medium">{condition}</span></p>
              <p className="text-lg font-bold text-white">
                {formatINR(pr.min)}
                <span className="text-slate-400 font-normal text-base"> – </span>
                {formatINR(pr.max)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{pr.label} · Average across India</p>
            </div>
          </div>
 
          <p className="text-sm text-slate-300 leading-relaxed">
            We'll find the top 3 real dental clinics near you using OpenStreetMap data
            and calculate their estimated cost based on clinic quality and proximity.
          </p>
 
          <button
            onClick={locate}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm
              bg-sky-500 hover:bg-sky-400 text-white transition-all duration-200
              shadow-lg shadow-sky-500/20 hover:shadow-sky-400/30 active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" />
            Find Clinics Near Me
          </button>
          <p className="text-center text-xs text-slate-500">
            Uses your location · No account needed · Completely free
          </p>
        </div>
      </div>
    );
  }
 
  if (state === 'locating' || state === 'fetching') {
    const msg = state === 'locating' ? 'Getting your location…' : 'Finding dental clinics nearby…';
    const sub = state === 'locating' ? 'Allow location access if prompted' : 'Querying OpenStreetMap · Calculating costs';
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-sky-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{msg}</p>
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
      </div>
    );
  }
 
  if (state === 'error') {
    return (
      <div className="rounded-2xl border border-red-800/40 bg-red-950/20 p-6 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <div>
          <p className="text-sm font-semibold text-red-300">Could not load clinics</p>
          <p className="text-xs text-red-400/70 mt-1 max-w-sm">{errorMsg}</p>
        </div>
        <button
          onClick={locate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            Top 3 Clinics Near {areaName || 'You'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sorted by best value · {condition} · Base: {formatINR(baseRange.min)}–{formatINR(baseRange.max)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(v => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400
              hover:text-white hover:border-slate-500 transition-colors"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button
            onClick={locate}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400
              hover:text-white hover:border-slate-500 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>
 
      {showMap && userCoords && (
        <div className="relative">
          <ClinicMap
            userCoords={userCoords}
            clinics={clinics}
            activeId={activeClinicId}
            onMarkerClick={setActiveClinicId}
          />
          <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
            {clinics.map((c, i) => {
              const colors = ['#EF4444', '#F59E0B', '#22C55E'];
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveClinicId(c.id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold
                    bg-slate-900/90 border transition-all"
                  style={{
                    borderColor: activeClinicId === c.id ? colors[i] : 'rgba(51,65,85,0.8)',
                    color: colors[i],
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: colors[i] }}
                  />
                  #{i + 1} {c.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
          <div className="absolute top-2 right-2 bg-slate-900/80 text-[10px] text-slate-400 px-2 py-0.5 rounded">
            © OpenStreetMap
          </div>
        </div>
      )}
 
      <div className="space-y-3">
        {clinics.map((clinic, i) => {
          const isActive = clinic.id === activeClinicId;
          const rankColors = [
            'border-amber-500/30 shadow-amber-500/5',
            'border-sky-500/20 shadow-sky-500/5',
            'border-emerald-500/20 shadow-emerald-500/5',
          ];
 
          return (
            <div
              key={clinic.id}
              onClick={() => setActiveClinicId(clinic.id)}
              className={`relative rounded-2xl border bg-slate-800/50 p-4 cursor-pointer
                transition-all duration-200 hover:bg-slate-800/80
                ${isActive
                  ? `${rankColors[i]} shadow-lg ring-1 ring-inset ring-white/5`
                  : 'border-slate-700/40'
                }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5"
                    style={{
                      background: ['rgba(245,158,11,0.15)', 'rgba(14,165,233,0.15)', 'rgba(34,197,94,0.15)'][i],
                      color: ['#F59E0B', '#0EA5E9', '#22C55E'][i],
                      border: `1.5px solid ${['rgba(245,158,11,0.4)', 'rgba(14,165,233,0.4)', 'rgba(34,197,94,0.4)'][i]}`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-bold text-white leading-tight truncate">
                        {clinic.name}
                      </h4>
                      <RankBadge rank={i} />
                      {clinic.isGreatValue && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold
                          px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <TrendingDown className="w-2.5 h-2.5" />
                          Great Value
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{clinic.address}</span>
                    </div>
                  </div>
                </div>
 
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-white leading-tight">
                    {formatINR(clinic.adjustedMin)}
                  </p>
                  <p className="text-xs text-slate-400">
                    – {formatINR(clinic.adjustedMax)}
                  </p>
                </div>
              </div>
 
              <div className="flex items-center gap-4 mb-3 ml-11">
                <StarRating rating={clinic.simulatedRating} />
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">
                  {clinic.distanceKm.toFixed(1)} km away
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: clinic.multiplierLabel === 'Best Value'
                      ? 'rgba(34,197,94,0.12)' : clinic.multiplierLabel === 'Trusted'
                      ? 'rgba(14,165,233,0.12)' : 'rgba(245,158,11,0.12)',
                    color: clinic.multiplierLabel === 'Best Value'
                      ? '#4ADE80' : clinic.multiplierLabel === 'Trusted'
                      ? '#38BDF8' : '#FBBF24',
                  }}
                >
                  {clinic.multiplierLabel}
                </span>
              </div>
 
              {(clinic.phone || clinic.hours) && (
                <div className="flex items-center gap-4 mb-3 ml-11">
                  {clinic.phone && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Phone className="w-3 h-3" />{clinic.phone}
                    </span>
                  )}
                  {clinic.hours && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="truncate max-w-[160px]">{clinic.hours}</span>
                    </span>
                  )}
                </div>
              )}
 
              <p className="text-[10px] text-slate-600 ml-11 mb-3 italic">
                * Estimated rating based on clinic proximity & data · Actual ratings may vary
              </p>
 
              <div className="flex gap-2 ml-11">
                <a
                  href={clinic.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold
                    bg-sky-500/15 border border-sky-500/30 text-sky-400
                    hover:bg-sky-500/25 transition-colors"
                >
                  <Navigation className="w-3 h-3" /> Get Directions
                </a>
                <a
                  href={clinic.osmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold
                    bg-slate-700/50 border border-slate-600/40 text-slate-300
                    hover:bg-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> View on OSM
                </a>
                {isActive && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-sky-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    On map
                  </span>
                )}
              </div>
 
              {isActive && (
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              )}
            </div>
          );
        })}
      </div>
 
      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-700/30">
        <AlertCircle className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Clinic data from <strong className="text-slate-400">OpenStreetMap</strong>. 
          Cost estimates are calculated from base market rates adjusted for clinic quality.
          Actual prices vary — always confirm with the clinic before booking.
          Ratings are estimated and not from verified reviews.
        </p>
      </div>
    </div>
  );
}
