import React, { useState } from 'react';
import { useFloating, offset, flip, shift, autoPlacement, FloatingPortal } from '@floating-ui/react';

/**
 * SmartTooltip Component
 * Uses Floating UI to automatically position tooltips, avoiding viewport clipping
 * Supports all edges with automatic fallback positioning
 */
export default function SmartTooltip({ children, text, content, side = 'top', asChild = false, referenceStyle, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: side,
    middleware: [
      offset(8), // 8px gap between trigger and tooltip
      flip(), // Flip to opposite side if clipped
      shift({ padding: 8 }), // Shift horizontally/vertically to stay in viewport
      autoPlacement({ padding: 8 }) // Auto-select best placement
    ]
  });

  const tooltipNode = (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          backgroundColor: '#0d1b2a',
          color: '#ffffff',
          padding: '0.35rem 0.5rem',
          borderRadius: '3px',
          fontSize: '0.65rem',
          lineHeight: '1.3',
          maxWidth: '260px',
          whiteSpace: 'normal',
          border: '1px solid #1b4965',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: floatingStyles.transform ? 1 : 0,
          transition: 'opacity 0.15s ease-out',
          animation: floatingStyles.transform ? 'fadeIn 0.15s ease-out' : 'none'
        }}
      >
        {content ?? text}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </FloatingPortal>
  );

  if (asChild && React.isValidElement(children)) {
    const child = children;
    const mergedEnter = (e) => {
      child.props?.onMouseEnter && child.props.onMouseEnter(e);
      setIsOpen(true);
    };
    const mergedLeave = (e) => {
      child.props?.onMouseLeave && child.props.onMouseLeave(e);
      setIsOpen(false);
    };
    return (
      <>
        {React.cloneElement(child, {
          ref: refs.setReference,
          onMouseEnter: mergedEnter,
          onMouseLeave: mergedLeave
        })}
        {isOpen && tooltipNode}
      </>
    );
  }

  return (
    <div
      ref={refs.setReference}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={className}
      style={{ display: 'inline-flex', cursor: 'help', ...(referenceStyle || {}) }}
    >
      {children}
      {isOpen && tooltipNode}
    </div>
  );
}
