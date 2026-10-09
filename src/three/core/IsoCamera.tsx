import { useEffect, useMemo, useRef } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp, damp3 } from 'maath/easing';
import { MathUtils, Vector3, type OrthographicCamera as Ortho } from 'three';

const DISTANCE = 40;
const DEFAULT_AZIMUTH = 45;
const DEFAULT_ELEVATION = 35;
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
  /** Viewing angles in degrees; they ease like the position. Defaults give the usual isometric view. */
  azimuth?: number;
  elevation?: number;
  reducedMotion?: boolean;
  /** Ease time constant; larger is slower. 0.2 gives the ≈0.8 s district fly-in. */
  smoothTime?: number;
};

/**
 * Orthographic isometric camera (elevation ≈35°, azimuth 45°, no free orbit).
 * Eases toward `focus`; with reduced motion it cuts instead.
 */
export function IsoCamera({ focus, home = [0, 0, 0], fitWidth = 26, fitHeight = 18, focusZoom = 1.35, azimuth = DEFAULT_AZIMUTH, elevation = DEFAULT_ELEVATION, reducedMotion = false, smoothTime = SMOOTH }: IsoCameraProps) {
  const ref = useRef<Ortho>(null);
  const size = useThree((s) => s.size);
  const angles = useRef({ az: azimuth, el: elevation });
  const offset = useMemo(() => new Vector3(), []);
  const setOffset = () => offset.set(Math.cos(MathUtils.degToRad(angles.current.el)) * Math.sin(MathUtils.degToRad(angles.current.az)), Math.sin(MathUtils.degToRad(angles.current.el)), Math.cos(MathUtils.degToRad(angles.current.el)) * Math.cos(MathUtils.degToRad(angles.current.az))).multiplyScalar(DISTANCE);
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
    angles.current = { az: azimuth, el: elevation };
    setOffset();
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
      angles.current = { az: azimuth, el: elevation };
    } else {
      damp3(target.current, goal, smoothTime, dt);
      damp(cam, 'zoom', goalZoom, smoothTime, dt);
      damp(angles.current, 'az', azimuth, smoothTime, dt);
      damp(angles.current, 'el', elevation, smoothTime, dt);
    }
    setOffset();
    pos.copy(target.current).add(offset);
    cam.position.copy(pos);
    cam.lookAt(target.current);
    cam.updateProjectionMatrix();
  });

  return <OrthographicCamera ref={ref} makeDefault near={-100} far={200} zoom={goalZoom} position={[offset.x, offset.y, offset.z]} />;
}
