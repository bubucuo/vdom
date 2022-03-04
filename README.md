# vdom

精讲虚拟 DOM，包括虚拟 DOM 构造、React 与 Vue 的 DIFF 算法等。

该下班了 

function getSequence(arr) {
// return [1, 2];

    const n = arr.length;
    // 路径，最不济也是有0个元素
    const result = [0];

    let resultLast;

    // 复制一份arr，记录元素i的真实位置
    const recordIndexOfI = arr.slice();

    for (let i = 0; i < n; i++) {
      const arrI = arr[i];
      // 如果元素为0，证明当前位置上没有新元素，不需要就算到lis里，跳过即可
      if (arrI !== 0) {
        // result最后一个元素
        resultLast = result[result.length - 1];
        // 如果arrI大于lis中最后一个元素，那么当前元素与老li构成新的lis，这个时候把arrI插入到lis里即可
        if (arr[resultLast] < arrI) {
          // 如果
          recordIndexOfI[i] = resultLast;
          result.push(i);
          continue;
        }
        // 否则把arrI插入到lis中，因为lis是有序的，所以这个时候我们可以使用二分插入
        let left = 0,
          right = result.length - 1;
        while (left < right) {
          const mid = (left + right) >> 1;
          if (arr[result[mid]] < arrI) {
            // mid < 目标元素， 在右边
            left = mid + 1;
          } else {
            right = mid;
          }
        }

        // 要插入的位置在left
        if (arrI < arr[result[left]]) {
          if (left > 0) {
            // 如果left是有效位
          }
          //
          result[left] = i;
        }
      }
    }

    return result;

}
