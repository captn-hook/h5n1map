'use client';
import styles from './globals.css';
import Container from "@/components/container/container";
import getData from "@/components/utils/data";
import { useState, useEffect } from 'react';

export const dynamic = 'force-static';

export default function Home() {
  const [allData, setAllData] = useState({});
  const [lastUpdated, setLastUpdated] = useState('Unknown');
  const [showLastUpdated, setShowLastUpdated] = useState(true);

  useEffect(() => {
    if (Object.keys(allData).length === 0) {
      getData().then((a) => {
        setAllData(a[0]);
        setLastUpdated(a[1]);
        setShowLastUpdated(a[2]);
      });
    }
  }, []);

  return (
    <main>
      <Container allData={allData} lastUpdated={lastUpdated} showLastUpdated={showLastUpdated} />
    </main>
  );
}
