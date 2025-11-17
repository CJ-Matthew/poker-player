import { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import type { TableData } from '../types/poker';

export const useTable = (tableId: string): TableData | null => {
  const [tableData, setTableData] = useState<TableData | null>(null);

  useEffect(() => {
    if (!tableId) return;

    const tableRef = ref(database, `tables/${tableId}`);
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val() as TableData | null;
      setTableData(data);
    });

    return () => unsubscribe();
  }, [tableId]);

  return tableData;
};