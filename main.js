const fs = require("fs");

// converts sudoku from string to 2D array representation
const toArr = (str) =>
  [...str].map((x) =>
    x === "." ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [parseInt(x)]
  );

// converts sudoku from 2D array back to string representation
const toStr = (node) =>
  node.map((x) => (x.length > 1 ? "." : x.length < 1 ? "?" : x[0])).join("");

// prints formatted sudoku string to the console
const printf = (str) => {
  if (!str) {
    console.log();
    return;
  }
  console.log(str.slice(0, 9));
  printf(str.slice(9));
};

// returns corresponding field number for given index
const row = (i) => Math.floor(i / 9);
const col = (i) => i % 9;
const box = (i) => Math.floor((i % 9) / 3) + Math.floor(i / 27) * 3;

// returns field corresponding to array index i in sudoku node
const getFieldByIndex = (field, i, node) =>
  node.filter((_, j) => field(i) === field(j));

// returns nth field (0-8) from sudoku node
const getFieldByNumber = (field, n, node) =>
  node.filter((_, i) => field(i) === n);

// returns cell at i in sudoku node minus nonviable candidates
const prune = (i, node) => {
  const cell = node[i];
  const singeltons = [
    ...getFieldByIndex(row, i, node),
    ...getFieldByIndex(col, i, node),
    ...getFieldByIndex(box, i, node),
  ]
    .filter((x) => x.length === 1)
    .flat();
  return cell.filter((x) => !singeltons.includes(x));
};

// returns true is field is valid else false
const validate = (field) => {
  const singeltons = field.filter((x) => x.length === 1).flat();
  const hasDuplicates = singeltons.length !== new Set(singeltons).size;
  const hasUnsolvables = field.filter((x) => x.length === 0).length > 0;
  return !hasDuplicates && !hasUnsolvables;
};

// returns pruned node
const pruneNode = (node) =>
  node.map((x, i) => (x.length === 1 ? x : prune(i, node)));

// returns true if node is a valid sudoku else false
const validateNode = (node) => {
  const fieldnum = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const rows = fieldnum.map((x) => getFieldByNumber(row, x, node));
  const cols = fieldnum.map((x) => getFieldByNumber(col, x, node));
  const boxs = fieldnum.map((x) => getFieldByNumber(box, x, node));

  const checkFields = [...rows, ...cols, ...boxs].map((x) => validate(x));
  return checkFields.reduce((a, x) => a && x);
};

// solves for one cell and returns it as nextNode
// updatedNode is the input node updated to remove the chosen candidate
const move = (node) => {
  const L = node
    .filter((x) => x.length > 1)
    .sort((a, b) => a.length - b.length)[0].length;
  const i = node.findIndex((x) => x.length === L);
  const candidates = node[i];
  const updateCell = (n) => [...node.slice(0, i), n, ...node.slice(i + 1)];
  const updatedNode = updateCell(candidates.slice(0, -1));
  const nextNode = updateCell(candidates.slice(-1));
  return [pruneNode(updatedNode), pruneNode(nextNode)];
};

// given a decision tree of sudoku nodes, returns a new tree
// which traces the path from the sudoku initial state i.e. 1st node
// to the final solved state i.e. last node
const solve = (tree, i = 0) => {
  const node = tree.slice(-1)[0];
  if (!validateNode(node)) return solve(tree.slice(0, -1), i + 1);
  if (node.flat().length === 81 || i > 100) return tree;
  const [updatedNode, nextNode] = move(node);
  return solve([...tree.slice(0, -1), updatedNode, nextNode], i + 1);
};

// solves and returns given sudoku string
const solver = (str) => {
  let tree = [toArr(str)];
  while (tree.slice(-1)[0].flat().length !== 81) tree = solve(tree);
  return toStr(tree.slice(-1)[0]);
};

// const buffer = fs.readFileSync("in", "utf8");
// const input = buffer.split("\r\n").filter((x) => x !== "");
// const unsolved = input.filter((_, i) => i % 2 === 0);
// const verified = input.filter((_, i) => i % 2 !== 0);
// const solved = unsolved.map((str) => solver(str));

// console.log(solved);
// console.log(solved.map((x, i) => x === verified[i]));
