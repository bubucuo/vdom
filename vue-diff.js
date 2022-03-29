// vdom 虚拟dom
// old 老节点
// new 新节点
// old array  a b c d e f g
// new array  a b e c d h f g

// mountElement 新增元素 h
// patch  复用元素 a b c d e f g
// unmount 删除元素
// todo
// move 元素移动 ?

exports.diffArray = (c1, c2, { mountElement, patch, unmount, move }) => {
  function isSameVnodeType(n1, n2) {
    return n1.key === n2.key; // && n1.type === n2.type;
  }

  let l1 = c1.length;
  let l2 = c2.length;
  let i = 0;
  let e1 = l1 - 1;
  let e2 = l2 - 1;

  // *1 从左边往右，如果元素可以复用就继续往右边，否则就停止循环
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

  // *2 从右边往左，如果元素可以复用就继续往左边，否则就停止循环
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
    if (i <= e1) {
      while (i <= e1) {
        const n1 = c1[i];
        unmount(n1.key);
        i++;
      }
    }
  } else {
    // *4 新老节点都还有，但是顺序不稳定，有点乱

    // * 4.1 把新元素做成Map，key:value(index)
    const s1 = i;
    const s2 = i;

    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }

    // *4.2 记录一下新老元素的相对下标
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatched);
    // 数组的下标记录的是新元素的相对下标，
    // value初始值是0
    // todo 在4.3中做一件事：一旦元素可以被复用，value值更新成老元素的下标+1
    // 数组的值如果还是0， 证明这个值在新元素中是要mount的
    for (i = 0; i < toBePatched; i++) {
      newIndexToOldIndexMap[i] = 0;
    }

    // * 4.3 去遍历老元素 （patch、unmount）
    // old sdasjkjkkklll
    // new ds
    // 记录新节点要多少个还没处理
    let patched = 0;

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
        // 没有找到要复用它的节点，只能删除
        unmount(prevChild.key);
      } else {
        // 节点要被复用
        //  1 2 3 5 10
        // maxNewIndexSoFar记录队伍最后一个元素的下标
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          // 插队
          moved = true;
        }

        // newIndex - s2是相对下标
        // i + 1老元素下标+1
        newIndexToOldIndexMap[newIndex - s2] = i + 1;

        patch(prevChild.key);
        patched++;
      }
    }

    // * 4.4 去遍新元素 mount、move
    // e2 -> i 下标遍历
    // toBePatched -> 0 相对下标
    // [1, 2];

    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : [];

    console.log("increasingNewIndexSequence", increasingNewIndexSequence); //sy-log
    let lastIndex = increasingNewIndexSequence.length - 1;
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextChild = c2[s2 + i];

      // 判断节点是mount还是move
      if (newIndexToOldIndexMap[i] === 0) {
        // nextChild要新增
        mountElement(nextChild.key);
      } else {
        // 可能move
        // i 是新元素的相对下标
        // lastIndex是LIS的相对下标
        if (lastIndex < 0 || i !== increasingNewIndexSequence[lastIndex]) {
          console.log("ooo", nextChild.key); //sy-log
          move(nextChild.key);
        } else {
          lastIndex--;
        }
      }
    }
  }

  // function getSequence() {
  //   return [1, 2];
  // }

  //  1 2 5 [2]
  function getSequence(arr) {
    // return [1, 2];

    // 返回的是LIS的路径
    const lis = [0];

    const len = arr.length;

    const record = arr.slice();

    for (let i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        const last = lis[lis.length - 1];
        if (arr[last] < arrI) {
          // 新来的元素比lis最后一个元素大，直接放到lis最后
          //  1 3 5 10
          record[i] = last;
          lis.push(i);
          continue;
        }

        // 二分替换
        let left = 0,
          right = lis.length - 1;
        while (left < right) {
          const mid = (left + right) >> 1;
          if (arr[lis[mid]] < arrI) {
            // 在右边
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        // 从lis里找比arrI大的最小的元素，并且替换
        if (arrI < arr[lis[left]]) {
          if (left > 0) {
            record[i] = lis[left - 1];
          }
          lis[left] = i;
        }
      }
    }

    let i = lis.length;
    let last = lis[i - 1];

    while (i-- > 0) {
      lis[i] = last;
      last = record[last];
    }

    console.log("l-----is", lis); //sy-log

    return lis;
  }
};
