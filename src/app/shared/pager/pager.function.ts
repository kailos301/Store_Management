export const pager = (visiblePages: number) => (totalPagesCount: number, selected: number) => {
  const half = Math.floor(visiblePages / 2);
  let start = selected - half;
  let end = selected + half;

  if (start <= 0) {
    start = 1;
    end = visiblePages;
  }
  if (end > totalPagesCount) {
    start = totalPagesCount - visiblePages + 1;
    end = totalPagesCount;
  }
  if (totalPagesCount < visiblePages) {
    start = 1;
    end = totalPagesCount;
  }

  return {
    pagesList: range(start, end),
    // totalPagesCount: totalPagesCount,
    visiblePages
  };
};

function range(start: number, end: number): number[] {
  return new Array<number>(end - start + 1).fill(start).map((val, index) => val + index);
}
