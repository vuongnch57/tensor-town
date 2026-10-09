import { useEffect, useMemo, useRef } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp, damp3 } from 'maath/easing';
import { MathUtils, Vector3, type OrthographicCamera as Ortho } from 'three';

const ELEVATION = MathUtils.degToRad(35);
const AZIMUTH = MathUtils.degToRad(45);
const DISTANCE = 40;
/** Default ease time: ≈0.4 s (SPEC §4.4). */
const SMOOTH = 0.12;

export type IsoCameraProps = {
  /** World point to look at. `null` = zone overview (`home`). */
  focus: [number, number, number] | null;
  home?: [number, number, number];
  /** World width (units) that should fit the viewport in the overview. */
  fitWidth?: number;
  fitHeight?: number;
  /** Zoom multiplier while focused on an object. */
  focusZoom?: number;
  reducedMotion?: boolean;
  /** Ease time constant; larger is slower. 0.2 gives the ≈0.8 s district fly-in. */
  smoothTime?: number;
};

/**
 * Orthographic isometric camera (elevation ≈35°, azimuth 45°, no free orbit).
 * Eases toward `focus`; with reduced motion it cuts instead.
 */
export function IsoCamera({ focus, home = [0, 0, 0], fitWidth = 26, fitHeight = 18, focusZoom = 1.35, reducedMotion = false, smoothTime = SMOOTH }: IsoCameraProps) {
  const ref = useRef<Ortho>(null);
  const size = useThree((s) => s.size);
  const offset = useMemo(() => new Vector3(Math.cos(ELEVATION) * Math.sin(AZIMUTH), Math.sin(ELEVATION), Math.cos(ELEVATION) * Math.cos(AZIMUTH)).multiplyScalar(DISTANCE), []);
  const target = useRef(new Vector3(...home));
  const goal = useMemo(() => new Vector3(), []);
  const pos = useMemo(() => new Vector3(), []);

  const baseZoom = Math.min(size.width / fitWidth, size.height / fitHeight);
  const goalZoom = baseZoom * (focus ? focusZoom : 1);

  // Snap on mount and on viewport / motion preference change.
  useEffect(() => {
    const cam = ref.current;
    if (!cam) return;
    goal.set(...(focus ?? home));
    target.current.copy(goal);
    cam.zoom = goalZoom;
    cam.position.copy(goal).add(offset);
    cam.lookAt(goal);
    cam.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useFrame((_, dt) => {
    const cam = ref.current;
    if (!cam) return;
    goal.set(...(focus ?? home));
    if (reducedMotion) {
      target.current.copy(goal);
      cam.zoom = goalZoom;
    } else {
      damp3(target.current, goal, smoothTime, dt);
      damp(cam, 'zoom', goalZoom, smoothTime, dt);
    }
    pos.copy(target.current).add(offset);
    cam.position.copy(pos);
    cam.lookAt(target.current);
    cam.updateProjectionMatrix();
  });

  return <OrthographicCamera ref={ref} makeDefault near={-100} far={200} zoom={goalZoom} position={[offset.x, offset.y, offset.z]} />;
}
