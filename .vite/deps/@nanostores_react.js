import { r as __toESM } from "./chunk-BoAXSpZd.js";
import { r as listenKeys } from "./nanostores-BeIGPeTF.js";
import { t as require_react } from "./react.js";
//#region node_modules/.pnpm/@nanostores+react@1.0.0_nanostores@1.1.0_react@19.2.3/node_modules/@nanostores/react/index.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var emit = (snapshotRef, onChange) => (value) => {
	if (snapshotRef.current === value) return;
	snapshotRef.current = value;
	onChange();
};
function useStore(store, { keys, deps = [store, keys] } = {}) {
	let snapshotRef = (0, import_react.useRef)();
	snapshotRef.current = store.get();
	let subscribe = (0, import_react.useCallback)((onChange) => {
		emit(snapshotRef, onChange)(store.value);
		return keys?.length > 0 ? listenKeys(store, keys, emit(snapshotRef, onChange)) : store.listen(emit(snapshotRef, onChange));
	}, deps);
	let get = () => snapshotRef.current;
	return (0, import_react.useSyncExternalStore)(subscribe, get, get);
}
//#endregion
export { useStore };

//# sourceMappingURL=@nanostores_react.js.map