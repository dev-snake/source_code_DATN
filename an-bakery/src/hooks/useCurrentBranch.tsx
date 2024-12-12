const useCurrentBranch = () => {
  return JSON.parse(localStorage?.getItem("staffInfo") ?? "{}")?.branchRef ?? null;
};

export default useCurrentBranch;
