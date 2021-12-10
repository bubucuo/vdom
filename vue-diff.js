// dom
// old array  a b c d e f g
// new array  a b e c d h f g

// mountElement 新增元素 h
// patch  复用元素 a b c d e f g
// unmount 删除元素
// todo
// move 元素移动 ?

exports.diffArray = (c1, c2, { mountElement, patch, unmount, move }) => {
  function isSameVnodeType(n1, n2) {
    return n1.key === n2.key; //&& n1.type === n2.type;
  }

  let i = 0;
  const l1 = c1.length;
  const l2 = c2.length;

  // 最后一个元素下标(end)
  let e1 = l1 - 1;
  let e2 = l2 - 1;

  // *1. 从左边按序查找，如果节点能复用，继续往右，不能就停止
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    if (isSameVnodeType(n1, n2)) {
      patch(n1.key);
    } else {
      break;
    }
    i++;
  }
  // *2. 从右边按序查找，如果节点能复用，继续往右，不能就停止
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVnodeType(n1, n2)) {
      patch(n1.key);
    } else {
      break;
    }
    e1--;
    e2--;
  }

  // *3. 老节点没了，但是新节点还有，新增剩下的新节点
  if (i > e1) {
    if (i <= e2) {
      while (i <= e2) {
        const n2 = c2[i];
        mountElement(n2.key);
        i++;
      }
    }
  }
  // *4. 老节点还有，但是新节点没了，删除剩下的老节点
  else if (i > e2) {
    while (i <= e1) {
      const n1 = c1[i];
      unmount(n1.key);
      i++;
    }
  } else {
    // *5. 新老节点都还有，但是是乱序的

    // start
    const s1 = i;
    const s2 = i;
    // *5.1把新元素做成Map，key:value = key: i
    // 数组删除插入元素O(n)，查找O(1)
    // 链表删除插入元素O(1),O(n)
    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }

    // *5.2 遍历老元素，用老元素的key去Map中找，找到了就能复用，找不到就删除

    // 需要mount或者patch的新元素有多少个
    const toBePatched = e2 - s2 + 1;

    // 数组的下标是新元素的相对下标，值是老元素的下标+1
    const newIndexToOldIndexMap = new Array(toBePatched);
    for (let i = 0; i < toBePatched; i++) {
      newIndexToOldIndexMap[i] = 0;
    }

    // 把新元素做成了Map： key:index
    // 遍历老元素
    let moved = false;
    let maxNewIndexSoFar = 0;
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      let newIndex = keyToNewIndexMap.get(prevChild.key);
      if (newIndex === undefined) {
        // 就删除
        unmount(prevChild.key);
      } else {
        // 数组的下标是新元素的相对下标，值是老元素的下标+1
        newIndexToOldIndexMap[newIndex - s2] = i + 1;

        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          // 相对位置发生变化
          moved = true;
        }

        patch(prevChild.key);
      }
    }
    // console.log("newIndexToOldIndexMap", newIndexToOldIndexMap); //sy-log

    // *5.3 遍历新元素，move、mount
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : [];
    let lastIndex = increasingNewIndexSequence.length - 1;
    // e1->s1
    // 遍历用的是相对位置
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];
      if (newIndexToOldIndexMap[i] === 0) {
        // 元素没有被复用过
        mountElement(nextChild.key);
      } else {
        // 判断元素是否要move
        // todo
        if (lastIndex < 0 || i !== increasingNewIndexSequence[lastIndex]) {
          move(nextChild.key);
        } else {
          lastIndex--;
        }
      }
    }
  }

  // function getSequence(arr) {
  //   return [1, 2];
  // }

  function getSequence(arr) {
    //   初始值是arr，p[i]记录第i个位置的索引
    const recordIndexOfI = arr.slice();
    const result = [0];
    const len = arr.length;

    let resultLastIndex;
    let resultLast;

    for (let i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        // result最后一个元素
        resultLastIndex = result.length - 1;
        resultLast = result[resultLastIndex];
        if (arr[resultLast] < arrI) {
          recordIndexOfI[i] = resultLast;
          result.push(i);
          continue;
        }
        let left = 0,
          right = resultLastIndex;
        while (left < right) {
          const mid = (left + right) >> 1;
          if (arr[result[mid]] < arrI) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }

        if (arrI < arr[result[left]]) {
          if (left > 0) {
            recordIndexOfI[i] = result[left - 1];
          }
          result[left] = i;
        }
      }
    }

    //  recordIndexOfI记录了正确的索引 result 进而找到最终正确的索引
    resultLastIndex = result.length - 1;
    resultLast = result[resultLastIndex];

    while (resultLastIndex >= 0) {
      result[resultLastIndex] = resultLast;
      resultLast = recordIndexOfI[resultLast];
      resultLastIndex--;
    }

    return result;
  }
};
