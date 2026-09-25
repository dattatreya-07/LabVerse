'use client';

import React from 'react';

interface MathFormulaProps {
  formula: string;
  className?: string;
  inline?: boolean;
}

/**
 * Converts LaTeX math notation into beautiful, human-readable typographic math.
 * Handles fractions, square roots, exponents, Greek symbols, summations, and scientific operators.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  className = '',
  inline = false,
}) => {
  const formatMathString = (latex: string): React.ReactNode => {
    if (!latex) return null;

    // Handle common full equations first for optimal typography
    const trimmed = latex.trim();

    // Clean up LaTeX commands to readable unicode/html math
    let text = trimmed;

    // Replace basic symbols
    text = text
      .replace(/\\cdot/g, ' · ')
      .replace(/\\times/g, ' × ')
      .replace(/\\pm/g, ' ± ')
      .replace(/\\approx/g, ' ≈ ')
      .replace(/\\propto/g, ' ∝ ')
      .replace(/\\infty/g, ' ∞ ')
      .replace(/\\pi/g, 'π')
      .replace(/\\nu/g, 'ν')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\Phi/g, 'Φ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\sum/g, '∑')
      .replace(/\\ln/g, 'ln')
      .replace(/\\log_\{10\}/g, 'log₁₀')
      .replace(/\\log/g, 'log')
      .replace(/\\sin\^4/g, 'sin⁴')
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\cot/g, 'cot')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\text\{([^}]+)\}/g, '$1');

    // Parse simple fractions: \frac{num}{den}
    const fracRegex = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = fracRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderSubSuperscripts(text.substring(lastIndex, match.index), `sub-${lastIndex}`));
      }
      const numerator = match[1].trim();
      const denominator = match[2].trim();

      parts.push(
        <span key={`frac-${match.index}`} className="inline-flex flex-col items-center justify-center align-middle mx-1 text-sm font-semibold">
          <span className="border-b border-current px-1 text-center leading-none pb-0.5">{renderSubSuperscripts(numerator, `num-${match.index}`)}</span>
          <span className="px-1 text-center leading-none pt-0.5">{renderSubSuperscripts(denominator, `den-${match.index}`)}</span>
        </span>
      );
      lastIndex = fracRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderSubSuperscripts(text.substring(lastIndex), `tail-${lastIndex}`));
    }

    return parts;
  };

  const renderSubSuperscripts = (str: string, keyPrefix: string): React.ReactNode => {
    // Handle square roots: \sqrt{...} or \sqrt{x}
    const sqrtRegex = /\\sqrt\{([^{}]+)\}/g;
    const segments: React.ReactNode[] = [];
    let curIndex = 0;
    let sMatch: RegExpExecArray | null;

    while ((sMatch = sqrtRegex.exec(str)) !== null) {
      if (sMatch.index > curIndex) {
        segments.push(parseSubSupText(str.substring(curIndex, sMatch.index), `${keyPrefix}-pre-${curIndex}`));
      }
      segments.push(
        <span key={`${keyPrefix}-sqrt-${sMatch.index}`} className="inline-flex items-center align-middle mx-0.5">
          <span className="text-lg leading-none mr-0.5">√</span>
          <span className="border-t border-current px-0.5">{parseSubSupText(sMatch[1], `${keyPrefix}-sqbody-${sMatch.index}`)}</span>
        </span>
      );
      curIndex = sqrtRegex.lastIndex;
    }

    if (curIndex < str.length) {
      segments.push(parseSubSupText(str.substring(curIndex), `${keyPrefix}-post-${curIndex}`));
    }

    return segments;
  };

  const parseSubSupText = (raw: string, key: string): React.ReactNode => {
    // Replace superscript and subscript notations
    // Example: E_{photon} -> E<sub className="...">photon</sub>
    // E^2 -> E<sup className="...">2</sup>
    const tokenRegex = /([a-zA-Z0-9πνλθΦφμσεαβΔ∑\(\)\[\]\+\-\=\·\×\s]+)(?:_\{([^}]+)\}|_([a-zA-Z0-9]))?(?:\^\{([^}]+)\}|\^([0-9a-zA-Z\+\-]))?/g;
    
    const nodes: React.ReactNode[] = [];
    let idx = 0;
    let m: RegExpExecArray | null;

    while ((m = tokenRegex.exec(raw)) !== null) {
      const base = m[1];
      const sub = m[2] || m[3];
      const sup = m[4] || m[5];

      if (!base && !sub && !sup) continue;

      nodes.push(
        <span key={`${key}-${idx++}`} className="inline-flex items-baseline">
          <span>{base}</span>
          {sub && <sub className="text-[0.7em] font-normal opacity-85 ml-0.5 -bottom-0.5">{sub}</sub>}
          {sup && <sup className="text-[0.7em] font-normal opacity-85 ml-0.5 -top-1">{sup}</sup>}
        </span>
      );
    }

    return nodes.length > 0 ? nodes : raw;
  };

  if (inline) {
    return (
      <span className={`inline-flex items-center font-sans tracking-normal ${className}`}>
        {formatMathString(formula)}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center font-sans tracking-wide ${className}`}>
      {formatMathString(formula)}
    </div>
  );
};
