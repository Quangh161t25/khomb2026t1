import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function FooterPortal({ children }) {
  const [target, setTarget] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.getElementById('footer-pagination-slot');
    }
    return null;
  });

  useEffect(() => {
    if (!target) {
      const el = document.getElementById('footer-pagination-slot');
      if (el) setTarget(el);
    }
  }, [target]);

  if (!target) return null;
  return createPortal(children, target);
}
