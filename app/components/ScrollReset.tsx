'use client';

import { useEffect } from 'react';

export const ScrollReset = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
};
