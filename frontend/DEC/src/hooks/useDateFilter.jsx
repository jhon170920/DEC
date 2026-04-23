import { useState, useEffect } from 'react';

export const useDateFilter = (defaultDaysBack = 30) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - defaultDaysBack);
    setEndDate(now.toISOString().slice(0, 10));
    setStartDate(past.toISOString().slice(0, 10));
  }, [defaultDaysBack]);

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return { startDate, endDate, setStartDate, setEndDate, clearDateFilters };
};