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
  selectedIso: string | null;
  focus: Focus | null;
  onHover: (feature: CountryFeature | null) => void;
  onPick: (feature: CountryFeature) => void;
};

export default function GlobeCanvas({
  geo,
  activeContinent,
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
        color: "#f2c89b",
        emissive: "#c98f5a",
        emissiveIntensity: 0.42,
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
          atmosphereColor="#e2904f"
          atmosphereAltitude={0.13}
          polygonsData={geo.features}
          polygonAltitude={(feature) => {
            const f = feature as CountryFeature;
            if (f.id === selectedIso) return 0.032;
            if (f.properties.continent === activeContinent) return 0.014;
            return 0.006;
          }}
          polygonCapColor={(feature) => {
            const f = feature as CountryFeature;
            if (f.id === selectedIso) return "#c2410c";
            if (f.properties.continent === activeContinent)
              return "rgba(226,137,63,0.62)";
            return "rgba(255,250,242,0.97)";
          }}
          polygonSideColor={() => "rgba(124,62,20,0.5)"}
          polygonStrokeColor={(feature) => {
            const f = feature as CountryFeature;
            if (f.id === selectedIso) return "#9a3412";
            if (f.properties.continent === activeContinent) return "#9a3412";
            return "rgba(198,146,104,0.8)";
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
