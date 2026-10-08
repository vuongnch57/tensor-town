import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Group, Mesh, MeshStandardMaterial } from 'three';
import { useFactoryStore } from '@/state/useFactoryStore';
import { scene } from '../core/palette';

export type SceneInteraction = { onSelect: (id: string) => void; reducedMotion: boolean };
export const SceneInteractionContext = createContext<SceneInteraction>({ onSelect: () => {}, reducedMotion: false });
export const useSceneInteraction = () => useContext(SceneInteractionContext);

const GLOW = new Color(scene.parcel).offsetHSL(0, 0.15, 0.1);
const DIM = new Color(scene.ground);
const DIM_AMOUNT = 0.18; // others fade ~15–20% toward the ground colour
const EASE = 12;

type Props = { id: string; position?: [number, number, number]; lift?: number; children: ReactNode };

/**
 * Wraps one clickable scene object. Selected: warm emissive rim, gentle lift and pulse.
 * Hovered: a lighter version of the same. Others dim when something is selected.
 */
export function Selectable({ id, position = [0, 0, 0], lift = 0.14, children }: Props) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const inner = useRef<Group>(null);
  const mats = useRef<{ m: MeshStandardMaterial; base: Color }[]>([]);
  const st = useMemo(() => ({ glow: 0, dim: 0, lift: 0 }), []);

  useLayoutEffect(() => {
    const list: { m: MeshStandardMaterial; base: Color }[] = [];
    inner.current?.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh && (mesh.material as MeshStandardMaterial).isMeshStandardMaterial) {
        const m = mesh.material as MeshStandardMaterial;
        list.push({ m, base: m.color.clone() });
      }
    });
    mats.current = list;
  }, []);

  useFrame(({ clock }, dt) => {
    const s = useFactoryStore.getState();
    const selected = s.selectedId === id;
    const hovered = s.hoveredId === id;
    const tGlow = selected ? 1 : hovered ? 0.45 : 0;
    const tDim = s.selectedId && !selected && !hovered ? 1 : 0;
    const k = reducedMotion ? 1 : Math.min(1, dt * EASE);
    const pulse = selected && !reducedMotion ? 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.6) : 0;
    const nextGlow = st.glow + (tGlow - st.glow) * k;
    const nextDim = st.dim + (tDim - st.dim) * k;
    const nextLift = st.lift + ((selected ? lift : 0) - st.lift) * k;
    const settled = Math.abs(nextGlow - st.glow) < 1e-4 && Math.abs(nextDim - st.dim) < 1e-4 && Math.abs(nextLift - st.lift) < 1e-4;
    st.glow = nextGlow;
    st.dim = nextDim;
    st.lift = nextLift;
    if (settled && !selected) return;
    if (inner.current) inner.current.position.y = st.lift + pulse * 0.03;
    const intensity = st.glow * (0.1 + 0.1 * pulse);
    for (const { m, base } of mats.current) {
      m.color.copy(base).lerp(DIM, st.dim * DIM_AMOUNT);
      m.emissive.copy(GLOW);
      m.emissiveIntensity = intensity;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        useFactoryStore.getState().hover(id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        const s = useFactoryStore.getState();
        if (s.hoveredId === id) s.hover(null);
        document.body.style.cursor = '';
      }}
    >
      <group ref={inner}>{children}</group>
    </group>
  );
}
