// Flow scope policy — the single gate between the UI and the connector.
//
// "Selected" means ONLY the keyframes highlighted in Premiere's Effect Controls panel.
// Premiere exposes no scripting API for that highlight state, so Azy detects it natively
// at apply time with the Delete/Ctrl+Z probe (see flow-selected.js): Delete removes
// exactly the highlighted keys, the inventory diff identifies them to the tick, and
// Ctrl+Z restores them before the easing is applied to just those keys. If the probe
// cannot run (no sender wired) Selected still fails closed — nothing speculative is
// ever sent to Premiere. Unknown ranges keep failing closed BEFORE any host request
// or undo group, because the connector bundle would silently treat them as "Clip".
const SELECTED_UNAVAILABLE = 'Selected keyframes need Azy\u2019s native highlight detection, which isn\u2019t available in this window. Choose Clip or Playhead. Nothing was applied.';
const SELECTED_UNSUPPORTED = 'Unsupported Flow scope. Choose Clip, Selected or Playhead. Nothing was applied.';

function selectedError() {
  const error = new Error(SELECTED_UNAVAILABLE);
  error.code = 'SELECTED_KEYFRAMES_UNAVAILABLE';
  return error;
}

function assertScope(scope) {
  if (scope != null && (typeof scope !== 'object' || Array.isArray(scope))) {
    throw new Error('Invalid Flow scope. Nothing was applied.');
  }
  const range = scope && scope.range;
  if (range === 'selected') return; // handled by the caller (probe) or refused there
  if (range != null && range !== 'all' && range !== 'playhead') {
    const error = new Error(SELECTED_UNSUPPORTED);
    error.code = 'UNSUPPORTED_FLOW_SCOPE';
    throw error;
  }
}

/**
 * Wrap a Flow facade. opts.probe() must resolve with { keys, warnings } from the native
 * detection probe; without it, Selected refuses exactly like before.
 */
function guardFlowScopes(flow, opts = {}) {
  const apply = flow.apply.bind(flow);
  const keyframes = flow.keyframes.bind(flow);
  flow.apply = async (id, scope, ...rest) => {
    assertScope(scope);
    if (scope && scope.range === 'selected') {
      if (typeof opts.probe !== 'function') throw selectedError();
      const detected = await opts.probe();
      const keys = detected && detected.keys;
      if (!Array.isArray(keys) || !keys.length) throw selectedError();
      const result = await apply(id, { range: 'selected', keys }, ...rest);
      const warnings = (detected && detected.warnings) || [];
      if (warnings.length && result && Array.isArray(result.warnings)) result.warnings = [...warnings, ...result.warnings];
      return result;
    }
    return apply(id, scope, ...rest);
  };
  // Previews never trigger the probe (no keystrokes outside an explicit apply): a
  // Selected keyframe listing is refused; Clip/Playhead previews pass through.
  flow.keyframes = async (scope) => {
    if (scope && !Array.isArray(scope) && typeof scope === 'object' && scope.range === 'selected') throw selectedError();
    assertScope(scope);
    return keyframes(scope);
  };
}

module.exports = { assertScope, guardFlowScopes, selectedError, SELECTED_UNAVAILABLE, SELECTED_UNSUPPORTED };
