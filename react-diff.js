const increasingNewIndexSequece = moved
  ? getSequence(newIndexToOldIndexMap)
  : [];
let lastIndex = increasingNewIndexSequece.length - 1;
// 相对下标
for (i = toBePatched - 1; i >= 0; i--) {
  const nextChildIndex = s2 + i;
  const nextChild = c2[nextChildIndex];

  // 判断nextChild是mount还是move
  // 在老元素中出现的元素可能要move，没有出现过的要mount
  if (newIndexToOldIndexMap[i] === 0) {
    mountElement(nextChild.key);
  } else {
    // 可能move
    if (lastIndex < 0 || i !== increasingNewIndexSequece[lastIndex]) {
      move(nextChild.key);
    } else {
      lastIndex--;
    }
  }
}
