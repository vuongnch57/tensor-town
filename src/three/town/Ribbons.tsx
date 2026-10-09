import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, CylinderGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { scene } from '../core/palette';
import { buildRibbons, type RibbonItem } from './model';

type Props = {
  /** Connection groups switched off in the menu. */
  hiddenGroups: string[];
  /** Connections drawn faded while a tour step runs. */
  isDimmed: (connId: string) => boolean;
};

const FADE = 0.86;

/** Roads, rail, belts, bridge, pipes, cables and the river: two draw calls (box segments, cylinder posts). */
export function Ribbons({ hiddenGroups, isDimmed }: Props) {
  const items = useMemo(buildRibbons, []);
  const segs = useMemo(() => items.filter((i) => i.shape === 'seg'), [items]);
  const posts = useMemo(() => items.filter((i) => i.shape === 'post'), [items]);
  const segRef = useRef<InstancedMesh>(null);
  const postRef = useRef<InstancedMesh>(null);
  const boxGeo = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const cylGeo = useMemo(() => new CylinderGeometry(1, 1, 1, 12), []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, metalness: 0 }), []);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const ground = new Color(scene.ground);
    const c = new Color();
    const fill = (mesh: InstancedMesh | null, list: RibbonItem[]) => {
      if (!mesh) return;
      list.forEach((it, i) => {
        const hidden = hiddenGroups.includes(it.group);
        dummy.position.set(it.x, it.y, it.z);
        dummy.rotation.set(0, it.rotY, 0);
        dummy.scale.set(hidden ? 0 : it.sx, hidden ? 0 : it.sy, hidden ? 0 : it.sz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        c.copy(it.color);
        if (isDimmed(it.connId)) c.lerp(ground, FADE);
        mesh.setColorAt(i, c);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };
    fill(segRef.current, segs);
    fill(postRef.current, posts);
  }, [segs, posts, hiddenGroups, isDimmed]);

  return (
    <group>
      <instancedMesh ref={segRef} args={[boxGeo, mat, segs.length]} receiveShadow castShadow />
      <instancedMesh ref={postRef} args={[cylGeo, mat, posts.length]} receiveShadow castShadow />
    </group>
  );
}
