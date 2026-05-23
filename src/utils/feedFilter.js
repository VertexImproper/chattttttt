export const filterReels = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    const media = item.media_or_ad || item;
    if (media.media_type === 2) return false;
    if (media.product_type === 'clips') return false;
    if (media.product_type === 'reels') return false;
    return true;
  });
};
