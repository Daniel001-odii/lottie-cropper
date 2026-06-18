export function cropLottieJSON(
  json: any,
  cropPct: { x: number; y: number; w: number; h: number }
) {
  // Deep clone to avoid mutating the original
  const result = JSON.parse(JSON.stringify(json));

  const oldW = result.w;
  const oldH = result.h;

  if (typeof oldW !== 'number' || typeof oldH !== 'number') {
    throw new Error('Invalid Lottie JSON: Missing valid width (w) or height (h).');
  }

  // Calculate absolute crop coordinates from percentages
  const cropX = (cropPct.x / 100) * oldW;
  const cropY = (cropPct.y / 100) * oldH;
  const cropW = (cropPct.w / 100) * oldW;
  const cropH = (cropPct.h / 100) * oldH;

  const precompAssetId = 'crop_comp_' + Date.now();

  if (!result.assets) {
    result.assets = [];
  }

  // Wrap the original layers into a new precomp asset
  result.assets.push({
    id: precompAssetId,
    layers: result.layers,
  });

  // Ensure we cover the original timeline
  const ip = result.ip ?? 0;
  const op = result.op ?? 99999;

  // Replace original layers with a single layer instantiating our precomp, 
  // translated by the crop offset.
  result.layers = [
    {
      ddd: 0,
      ind: 1,
      ty: 0, // 0 = Precomp layer
      nm: 'Cropped Layer',
      refId: precompAssetId,
      sr: 1, // Time stretch
      ks: { // Transform
        o: { a: 0, k: 100, ix: 11 }, // Opacity
        r: { a: 0, k: 0, ix: 10 },    // Rotation
        p: { a: 0, k: [-cropX, -cropY, 0], ix: 2 }, // Position (Translation)
        a: { a: 0, k: [0, 0, 0], ix: 1 },         // Anchor Point
        s: { a: 0, k: [100, 100, 100], ix: 6 },   // Scale
      },
      ao: 0,
      w: oldW,
      h: oldH,
      ip: ip,
      op: op,
      st: 0,
      bm: 0,
    },
  ];

  // Update root composition dimensions to the cropped size
  result.w = Math.round(cropW);
  result.h = Math.round(cropH);

  return result;
}
