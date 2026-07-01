'use client';

import { useState } from 'react';
import ApplyModal from './ApplyModal';

export default function ApplyButton({ course, className, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children || 'Apply Now'}
      </button>
      <ApplyModal isOpen={isOpen} onClose={() => setIsOpen(false)} preselectedCourse={course} />
    </>
  );
}