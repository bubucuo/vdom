describe("数组Diff", () => {
  // it("1. 左边查找", () => {
  //   const mountElement = jest.fn();
  //   const patch = jest.fn();
  //   const unmount = jest.fn();
  //   const move = jest.fn();
  //   const { diffArray } = require("../vue-diff");
  //   diffArray(
  //     [{ key: "a" }, { key: "b" }, { key: "c" }],
  //     [{ key: "a" }, { key: "b" }, { key: "d" }, { key: "e" }],
  //     {
  //       mountElement,
  //       patch,
  //       unmount,
  //       move,
  //     }
  //   );
  //   // 第一次调用次数
  //   expect(patch.mock.calls.length).toBe(2);
  //   // 第一次调用的第一个参数
  //   expect(patch.mock.calls[0][0]).toBe("a");
  //   expect(patch.mock.calls[1][0]).toBe("b");
  // });
  // it("2. 右边边查找", () => {
  //   const mountElement = jest.fn();
  //   const patch = jest.fn();
  //   const unmount = jest.fn();
  //   const move = jest.fn();
  //   const { diffArray } = require("../vue-diff");
  //   diffArray(
  //     [{ key: "a" }, { key: "b" }, { key: "c" }],
  //     [{ key: "d" }, { key: "e" }, { key: "b" }, { key: "c" }],
  //     {
  //       mountElement,
  //       patch,
  //       unmount,
  //       move,
  //     }
  //   );
  //   expect(patch.mock.calls.length).toBe(2);
  //   expect(patch.mock.calls[0][0]).toBe("c");
  //   expect(patch.mock.calls[1][0]).toBe("b");
  // });
  // it("3. 老节点没了，新节点还有", () => {
  //   const mountElement = jest.fn();
  //   const patch = jest.fn();
  //   const unmount = jest.fn();
  //   const move = jest.fn();
  //   const { diffArray } = require("../vue-diff");
  //   diffArray(
  //     [{ key: "a" }, { key: "b" }],
  //     [{ key: "a" }, { key: "b" }, { key: "c" }],
  //     {
  //       mountElement,
  //       patch,
  //       unmount,
  //       move,
  //     }
  //   );
  //   expect(patch.mock.calls.length).toBe(2);
  //   expect(patch.mock.calls[0][0]).toBe("a");
  //   expect(patch.mock.calls[1][0]).toBe("b");
  //   expect(mountElement.mock.calls[0][0]).toBe("c");
  // });
  // it("4. 老节点还有，新节点没了", () => {
  //   const mountElement = jest.fn();
  //   const patch = jest.fn();
  //   const unmount = jest.fn();
  //   const move = jest.fn();
  //   const { diffArray } = require("../vue-diff");
  //   diffArray(
  //     [{ key: "a" }, { key: "b" }, { key: "c" }],
  //     [{ key: "a" }, { key: "b" }],
  //     {
  //       mountElement,
  //       patch,
  //       unmount,
  //       move,
  //     }
  //   );
  //   // 第一次调用次数
  //   expect(patch.mock.calls.length).toBe(2);
  //   // 第一次调用的第一个参数
  //   expect(patch.mock.calls[0][0]).toBe("a");
  //   expect(patch.mock.calls[1][0]).toBe("b");
  //   expect(unmount.mock.calls[0][0]).toBe("c");
  // });
  // it("5. 新老节点都有，但是顺序不稳定", () => {
  //   const mountElement = jest.fn();
  //   const patch = jest.fn();
  //   const unmount = jest.fn();
  //   const move = jest.fn();
  //   const { diffArray } = require("../vue-diff");
  //   diffArray(
  //     [
  //       { key: "a" },
  //       { key: "b" },
  //       { key: "c" },
  //       { key: "d" },
  //       { key: "e" },
  //       { key: "f" },
  //       { key: "g" },
  //     ],
  //     [
  //       { key: "a" },
  //       { key: "b" },
  //       { key: "e" },
  //       { key: "d" },
  //       { key: "c" },
  //       { key: "h" },
  //       { key: "f" },
  //       { key: "g" },
  //     ],
  //     {
  //       mountElement,
  //       patch,
  //       unmount,
  //       move,
  //     }
  //   );
  //   // 第一次调用次数
  //   expect(patch.mock.calls.length).toBe(7);
  //   // 第一次调用的第一个参数
  //   expect(patch.mock.calls[0][0]).toBe("a");
  //   expect(patch.mock.calls[1][0]).toBe("b");
  //   expect(patch.mock.calls[2][0]).toBe("g");
  //   expect(patch.mock.calls[3][0]).toBe("f");
  //   expect(patch.mock.calls[4][0]).toBe("c");
  //   expect(patch.mock.calls[5][0]).toBe("d");
  //   expect(patch.mock.calls[6][0]).toBe("e");
  //   expect(unmount.mock.calls.length).toBe(0);
  //   //                 0 1  2 3 4  5 6
  //   // [i ... e1 + 1]: a b [c d e] f g
  //   // [i ... e2 + 1]: a b [e d c h] f g
  //   //                      4 3 2 0
  //   //                      [5 4 3 0]
  //   // e d c
  //   // e d c
  //   // todo
  //   // 1. mount
  //   expect(mountElement.mock.calls[0][0]).toBe("h");
  //   // // 2. move
  //   // expect(move.mock.calls[0][0]).toBe("d");
  //   // expect(move.mock.calls[1][0]).toBe("e");
  // });
  it("6. 新老节点都有，但是顺序不稳定", () => {
    const mountElement = jest.fn();
    const patch = jest.fn();
    const unmount = jest.fn();
    const move = jest.fn();
    const { diffArray } = require("../vue-diff");
    diffArray(
      [
        { key: "a" },
        { key: "b" },

        { key: "c" },
        { key: "d" },
        { key: "e" },

        { key: "f" },
        { key: "g" },
      ],
      [
        { key: "a" },
        { key: "b" },

        { key: "d1" },
        { key: "e" },
        { key: "c" },
        { key: "d" },
        { key: "h" },

        { key: "f" },
        { key: "g" },
      ],
      {
        mountElement,
        patch,
        unmount,
        move,
      }
    );
    // 第一次调用次数
    expect(patch.mock.calls.length).toBe(7);
    // 第一次调用的第一个参数
    expect(patch.mock.calls[0][0]).toBe("a");
    expect(patch.mock.calls[1][0]).toBe("b");

    expect(patch.mock.calls[2][0]).toBe("g");
    expect(patch.mock.calls[3][0]).toBe("f");

    expect(patch.mock.calls[4][0]).toBe("c");
    expect(patch.mock.calls[5][0]).toBe("d");
    expect(patch.mock.calls[6][0]).toBe("e");
    expect(unmount.mock.calls.length).toBe(0);
    //                 0 1  2 3 4  5 6
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e c d h] f g
    // 真实下标         0 1  2 3 4 5  6 7
    // 相对下标              0 1 2 3
    // 下标是新元素的相对下标，value是老元素的下标+1
    //                     [5,3,4,0]
    // todo
    // 1. mount
    expect(mountElement.mock.calls[0][0]).toBe("h");
    expect(mountElement.mock.calls[1][0]).toBe("d1");

    // 2. move
    expect(move.mock.calls[0][0]).toBe("e");
  });
});
