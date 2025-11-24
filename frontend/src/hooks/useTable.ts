import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { TableData } from '../types/poker';

export const useTable = (tableId: string): TableData | null => {
  const [tableData, setTableData] = useState<TableData | null>(null);

  useEffect(() => {
    if (!tableId) return;

    // Initial fetch
    const fetchTable = async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('game_state')
        .eq('id', tableId)
        .single();
      
      if (data && data.game_state) {
        setTableData(data.game_state as TableData);
      } else if (error) {
        console.error('Error fetching table:', error);
      }
    };

    fetchTable();

    // Subscribe to changes
    const channel = supabase
      .channel(`table:${tableId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tables',
          filter: `id=eq.${tableId}`,
        },
        (payload) => {
          if (payload.new && payload.new.game_state) {
            setTableData(payload.new.game_state as TableData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId]);

  return tableData;
};