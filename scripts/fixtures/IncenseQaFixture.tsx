import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { IncenseBurner } from '../../src/components/IncenseBurner';
import '../../src/index.css';
function Fixture() {
 const [count, setCount] = useState(0);
 return <main className="max-w-xl mx-auto px-4 py-8"><h1 className="text-center font-serif text-2xl">Memorial incense</h1><IncenseBurner count={count} onLight={async () => { setCount(value => value + 1); }} /></main>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
