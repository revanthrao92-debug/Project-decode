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

type State = "selected" | "hovered" | "continent" | "base";

const ALTITUDE: Record<State, number> = {
  selected: 0.032,
  hovered: 0.018,
  continent: 0.01,
  base: 0.006,
};
const CAP: Record<State, string> = {
  selected: "#c2410c",
  hovered: "#f0913f",
  continent: "#f0913f",
  base: "rgba(247,203,160,0.97)",
};
const STROKE: Record<State, string> = {
  selected: "#9a3412",
  hovered: "#b45309",
  continent: "#b45309",
  base: "rgba(214,158,110,0.85)",
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

  // One place decides whether the globe spins: only when nothing is selected
  // or under the pointer.
  useEffect(() => {
    const controls = ready.current ? globe.current?.controls() : null;
    if (!controls) return;
    controls.autoRotate = !activeContinent && !selectedIso && !hoveredIso;
  }, [activeContinent, selectedIso, hoveredIso]);

  useEffect(() => {
    if (!focus) return;
    globe.current?.pointOfView(
      { lat: focus.lat, lng: focus.lng, altitude: focus.altitude },
      900,
    );
  }, [focus]);

  // Accessors are memoised so a hover only re-styles when its inputs change.
  const style = useMemo(() => {
    const state = (f: CountryFeature) =>
      f.id === selectedIso
        ? "selected"
        : f.id === hoveredIso
          ? "hovered"
          : f.properties.continent === activeContinent
            ? "continent"
            : "base";
    return {
      altitude: (f: object) => ALTITUDE[state(f as CountryFeature)],
      cap: (f: object) => CAP[state(f as CountryFeature)],
      stroke: (f: object) => STROKE[state(f as CountryFeature)],
    };
  }, [selectedIso, hoveredIso, activeContinent]);

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
          polygonAltitude={style.altitude}
          polygonCapColor={style.cap}
          polygonSideColor={() => "rgba(146,96,44,0.55)"}
          polygonStrokeColor={style.stroke}
          polygonCapCurvatureResolution={3}
          onPolygonHover={(feature) => onHover((feature as CountryFeature) ?? null)}
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
