globalThis.GardenModels = globalThis.GardenModels || {};
GardenModels.registry = {};
GardenModels.animals = function (ctx) {
  const type = ctx.a.type,
    key = ['fox', 'wolf'].includes(type)
      ? 'fox-wolf'
      : ['sheep', 'alpaca'].includes(type)
        ? 'sheep-alpaca'
        : type;
  GardenModels.registry[key]?.(ctx);
};
