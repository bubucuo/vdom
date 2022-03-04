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
  let e1 = l1 - 1;
  let e2 = l2 - 1;

  // *1. 从左边往右查找，如果节点可以复用，则继续往右，不能就停止循环
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

  // *2. 从右边往左边查找，如果节点可以复用，则继续往左，不能就停止循环
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

  // *3.1 老节点没了，新节点还有
  if (i > e1) {
    if (i <= e2) {
      while (i <= e2) {
        const n2 = c2[i];
        mountElement(n2.key);
        i++;
      }
    }
  }

  // *3.2 老节点还有，新节点没了
  else if (i > e2) {
    while (i <= e1) {
      const n1 = c1[i];
      unmount(n1.key);
      i++;
    }
  } else {
    // *4 新老节点都有，但是顺序不稳定
    // 遍历新老节点
    // i是新老元素的起始位置

    // *4.1 把新元素做成Map图，key: value(index)
    const s1 = i;
    const s2 = i;

    //
    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }

    // *4.2 当前还有多少新元素要被patch(新增、更新)
    const toBePatched = e2 - s2 + 1;
    let patched = 0;

    const newIndexToOldIndexMap = new Array(toBePatched);
    // 下标是新元素的相对下标，值是老元素的下标+1
    for (i = 0; i < toBePatched; i++) {
      newIndexToOldIndexMap[i] = 0;
    }

    // *4.3 先遍历老元素 检查老元素是否要被复用，如果复用就patch，如果不能复用就删除
    let moved = false;
    let maxNewIndexSoFar = 0;
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i];

      if (patched >= toBePatched) {
        unmount(prevChild.key);
        continue;
      }

      const newIndex = keyToNewIndexMap.get(prevChild.key);
      if (newIndex === undefined) {
        // 节点没法复用
        unmount(prevChild.key);
      } else {
        //移动发生在这里，这里的节点可能要被移动（ecd）
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          // 相对位置发生变化
          moved = true;
        }
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        patch(prevChild.key);
        patched++;
      }
    }

    // *4.4 遍历新元素 mount move
    // 返回不需要移动的节点
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
  }

  // 返回不需要移动的节点
  // 得到最长递增子序列lis（算法+实际应用，跳过0），返回路径
  function getSequence(arr) {
    // return [1, 2];

    // 最长递增子序列路径, 有序递增
    const lis = [0];

    // 相当于复制一份arr数组，此数组用于稍后纠正lis用的
    const recordIndexOfI = arr.slice();

    const len = arr.length;
    for (let i = 0; i < len; i++) {
      const arrI = arr[i];
      // 如果元素值为0，证明节点是新增的，老dom上没有，肯定不需要移动，所以跳过0，不在lis里
      if (arrI !== 0) {
        // 判断arrI插入到lis哪里
        const last = lis[lis.length - 1];
        // arrI比lis最后一个元素还大，又构成最长递增
        if (arr[last] < arrI) {
          // 记录第i次的时候，本来的元素是什么，后面要做回溯的
          recordIndexOfI[i] = last;
          lis.push(i);
          continue;
        }
        // 二分查找插入元素
        let left = 0,
          right = lis.length - 1;
        while (left < right) {
          const mid = (left + right) >> 1;
          //  0 1 2 3 4 (1.5)
          if (arr[lis[mid]] < arrI) {
            // mid< 目标元素 ， 在右边
            left = mid + 1;
          } else {
            right = mid;
          }
        }

        if (arrI < arr[lis[left]]) {
          // 从lis中找到了比arrI大的元素里最小的那个，即arr[lis[left]]。
          // 否则则没有找到比arrI大的元素，就不需要做什么了
          if (left > 0) {
            // 记录第i次的时候，上次的元素的是什么，便于后面回溯
            recordIndexOfI[i] = lis[left - 1];
          }
          lis[left] = i;
        }
      }
    }

    // 遍历lis，纠正位置
    let i = lis.length;
    let last = lis[i - 1];

    while (i-- > 0) {
      lis[i] = last;
      last = recordIndexOfI[last];
    }

    return lis;
  }
};
