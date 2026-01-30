"use client";

import React, { useMemo } from 'react';
import { Formula } from '@/lib/logic/types';
import { LogicParser } from '@/lib/logic/parser';
import { motion } from 'framer-motion';

interface TreeNode {
  id: string;
  label: string;
  type: string;
  children: TreeNode[];
  x?: number;
  y?: number;
}

// Convert logic formula to tree structure
const formulaToTree = (formula: Formula, idPrefix = 'root'): TreeNode => {
  switch (formula.type) {
    case 'ATOM':
      return {
        id: `${idPrefix}`,
        label: formula.value,
        type: 'ATOM',
        children: []
      };
    case 'NOT':
      return {
        id: `${idPrefix}`,
        label: '¬',
        type: 'NOT',
        children: [formulaToTree(formula.operand, `${idPrefix}-0`)]
      };
    case 'BINARY':
      const opMap: Record<string, string> = {
        'AND': '∧',
        'OR': '∨',
        'IMPLIES': '→',
        'IFF': '↔'
      };
      return {
        id: `${idPrefix}`,
        label: opMap[formula.operator] || formula.operator,
        type: 'BINARY',
        children: [
          formulaToTree(formula.left, `${idPrefix}-0`),
          formulaToTree(formula.right, `${idPrefix}-1`)
        ]
      };
  }
};

// Calculate tree layout (simple Reingold-Tilford-like algorithm)
const calculateLayout = (node: TreeNode, depth: number = 0, nextX: { val: number } = { val: 0 }) => {
  const levelHeight = 80;

  // Post-order traversal to calculate X positions
  node.children.forEach(child => calculateLayout(child, depth + 1, nextX));

  node.y = depth * levelHeight + 40;

  if (node.children.length === 0) {
    // Leaf node
    node.x = nextX.val;
    nextX.val += 60 + 20; // Spacing
  } else if (node.children.length === 1) {
    // Single child (NOT)
    node.x = node.children[0].x;
  } else {
    // Binary op - center above children
    const leftX = node.children[0].x!;
    const rightX = node.children[node.children.length - 1].x!;
    node.x = (leftX + rightX) / 2;
  }
};

export const SyntaxTree = ({ formulaStr }: { formulaStr: string }) => {
  const data = useMemo(() => {
    try {
      if (!formulaStr.trim()) return null;
      const parser = new LogicParser();
      const formula = parser.parse(formulaStr);
      const root = formulaToTree(formula);

      const nextX = { val: 0 };
      calculateLayout(root, 0, nextX);

      return { root, width: nextX.val, height: (getDepth(root) + 1) * 80 };
    } catch {
      return null;
    }
  }, [formulaStr]);

  if (!data) return (
    <div className="flex items-center justify-center py-20 text-gray-500 italic">
      Ingresa una fórmula válida para ver el árbol
    </div>
  );

  const { root, width, height } = data;

  // Recursive render
  const renderLinks = (node: TreeNode): React.ReactNode[] => {
    return node.children.flatMap(child => {
      return [
        <motion.path
          key={`${node.id}-${child.id}`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          d={`M${node.x},${node.y} C${node.x},${node.y! + 40} ${child.x},${node.y! + 40} ${child.x},${child.y}`}
          className="stroke-gray-600 stroke-2 fill-none"
        />,
        ...renderLinks(child)
      ];
    });
  };

  const renderNodes = (node: TreeNode): React.ReactNode[] => {
    const isLeaf = node.children.length === 0;
    const colorClass = node.type === 'ATOM' ? 'fill-emerald-500/20 stroke-emerald-500'
      : node.type === 'NOT' ? 'fill-rose-500/20 stroke-rose-500'
        : 'fill-blue-500/20 stroke-blue-500';
    const textClass = node.type === 'ATOM' ? 'fill-emerald-400'
      : node.type === 'NOT' ? 'fill-rose-400'
        : 'fill-blue-400';

    return [
      <motion.g key={node.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
        <circle
          cx={node.x}
          cy={node.y}
          r={25}
          className={`${colorClass} stroke-2 transition-all duration-300 hover:fill-white/10 cursor-pointer`}
        />
        <text
          x={node.x}
          y={node.y}
          dy="0.35em"
          textAnchor="middle"
          className={`${textClass} font-bold text-lg select-none pointer-events-none`}
        >
          {node.label}
        </text>
      </motion.g>,
      ...node.children.flatMap(renderNodes)
    ];
  };

  return (
    <div className="w-full overflow-x-auto p-4 flex justify-center bg-black/20 rounded-xl border border-white/5">
      <svg width={Math.max(width, 600)} height={height} className="min-w-[600px] mx-auto">
        <g transform={`translate(${Math.max((600 - width) / 2, 20)}, 0)`}>
          {renderLinks(root)}
          {renderNodes(root)}
        </g>
      </svg>
    </div>
  );
};

function getDepth(node: TreeNode): number {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getDepth));
}
