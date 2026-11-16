"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import * as THREE from "three";
import type { CountryFeature, GeoCollection } from "@/lib/types";

export type Focus = {
  lat: number;
  lng: number;
  altitude: number;
};

type Props = {
  geo: GeoCollection | null;
  activeContinent: string | null;
  hoveredIso: string | null;
  selectedIso: string | null;
  focus: Focus | null;
  onHover: (feature: CountryFeature | null) => void;
  onPick: (feature: CountryFeature) => void;
};

export default function GlobeCanvas({
  geo,
  activeContinent,
  hoveredIso,
  selectedIso,
  focus,
  onHover,
  onPick,
}: Props) {
  const globe = useRef<GlobeMethods | undefined>(undefined);
  const wrap = useRef<HTMLDivElement | null>(null);
  const ready = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: "#bfd8e2",
        emissive: "#8fb3c3",
        emissiveIntensity: 0.45,
        shininess: 0.2,
      }),
    [],
  );

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ready.current || !globe.current) return;
    const controls = globe.current.controls();
    if (!controls) return;
    controls.autoRotate = !activeContinent && !selectedIso;
    controls.autoRotateSpeed = 0.45;
  }, [activeContinent, selectedIso]);

  useEffect(() => {
    if (!focus || !globe.current) return;
    globe.current.pointOfView(
      { lat: focus.lat, lng: focus.lng, altitude: focus.altitude },
      900,
    );
    const controls = globe.current.controls();
    if (controls) controls.autoRotate = false;
  }, [focus]);

  const handleReady = () => {
    if (ready.current || !globe.current) return;
    ready.current = true;

    globe.current.pointOfView({ lat: 20, lng: 78, altitude: 2.05 }, 0);

    const controls = globe.current.controls();
    if (!controls) return;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.minDistance = 150;
    controls.maxDistance = 560;
  };

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="Interactive globe. Use the continent buttons or the search field for the same results."
      className="globe-wrap relative h-full w-full [contain:paint]"
    >
      {geo && size.width > 0 ? (
        <Globe
          ref={globe}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={material}
          showAtmosphere
          atmosphereColor="#9dc4d4"
          atmosphereAltitude={0.13}
          polygonsData={geo.features}
          polygonAltitude={(feature) => {
            const f = feature as CountryFeature;
            if (f.id === selectedIso) return 0.032;
            if (f.id === hoveredIso) return 0.018;
            if (f.properties.continent === activeContinent) return 0.01;
            return 0.006;
          }}
          polygonCapColor={(feature) => {
            const f = feature as CountryFeature;
            if (f.id === selectedIso) return "#c2410c";
            if (f.id === hoveredIso) return "#f0913f";
            if (f.properties.continent === activeContinent) return "#f0913f";
            return "rgba(247,203,160,0.97)";
          }}
          polygonSideColor={() => "rgba(146,96,44,0.55)"}
          polygonStrokeColor={(feature) => {
            const f = feature as CountryFeature;
            if (f.id === selectedIso) return "#9a3412";
            if (f.id === hoveredIso) return "#b45309";
            if (f.properties.continent === activeContinent) return "#b45309";
            return "rgba(214,158,110,0.85)";
          }}
          polygonCapCurvatureResolution={3}
          onPolygonHover={(feature) => {
            onHover((feature as CountryFeature) ?? null);
            const controls = globe.current?.controls();
            if (controls && feature) controls.autoRotate = false;
          }}
          onPolygonClick={(feature) => onPick(feature as CountryFeature)}
          onGlobeReady={handleReady}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="globe-skeleton" />
        </div>
      )}
    </div>
  );
}
