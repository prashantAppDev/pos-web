import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Divider, Form, Input, InputNumber, Modal,
  notification, Select, Table, Typography,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { getSale, getSales } from '../../sales/api/sale.api';
import { useCreateReturn } from '../hooks/useReturns';
import type { SaleResponse, SaleSummaryResponse } from '../../../types/sale.types';
import type { ReturnReason } from '../../../types/return.types';
import { RETURN_REASON_LABELS } from '../../../types/return.types';

const { Text } = Typography;

const REASON_OPTIONS = Object.entries(RETURN_REASON_LABELS).map(([value, label]) => ({ value, label }));

interface RowState {
  selected: boolean;
  quantity: number;
  reason: ReturnReason;
  maxQty: number;
}

interface Props {
  open: boolean;
  storeId: string;
  onClose: () => void;
}

export const NewReturnModal = ({ open, storeId, onClose }: Props) => {
  const [phase, setPhase] = useState<'lookup' | 'select'>('lookup');
  const [txnSearch, setTxnSearch] = useState('');
  const [recentSales, setRecentSales] = useState<SaleSummaryResponse[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  const [sale, setSale] = useState<SaleResponse | null>(null);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [notes, setNotes] = useState('');

  const { mutate: createReturn, isPending } = useCreateReturn();

  useEffect(() => {
    if (!open) {
      setPhase('lookup');
      setTxnSearch('');
      setSale(null);
      setRowState({});
      setNotes('');
      setRecentSales([]);
    }
  }, [open]);

  useEffect(() => {
    if (open && phase === 'lookup') {
      setLoadingSales(true);
      getSales(storeId, { page: 0, size: 50 })
        .then((p) => setRecentSales(p.content))
        .catch(() => {})
        .finally(() => setLoadingSales(false));
    }
  }, [open, storeId, phase]);

  const filteredSales = useMemo(() => {
    const q = txnSearch.trim().toLowerCase();
    if (!q) return recentSales;
    return recentSales.filter((s) => s.transactionId.toLowerCase().includes(q));
  }, [recentSales, txnSearch]);

  const handleSelectSale = async (saleId: string) => {
    setLoadingSale(true);
    try {
      const fullSale = await getSale(storeId, saleId);
      setSale(fullSale);
      // Initialise row state — all unselected, full qty, no reason
      const init: Record<string, RowState> = {};
      for (const item of fullSale.items) {
        init[item.id] = { selected: false, quantity: item.quantity, maxQty: item.quantity, reason: 'DEFECTIVE' };
      }
      setRowState(init);
      setPhase('select');
    } catch {
      notification.error({ message: 'Could not load sale details' });
    } finally {
      setLoadingSale(false);
    }
  };

  const updateRow = (itemId: string, patch: Partial<RowState>) => {
    setRowState((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  };

  const selectedItems = sale?.items.filter((i) => rowState[i.id]?.selected) ?? [];
  const refundTotal = selectedItems.reduce((sum, i) => {
    const row = rowState[i.id];
    return sum + i.sellingPrice * (row?.quantity ?? 0);
  }, 0);

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      notification.warning({ message: 'Select at least one item to return' });
      return;
    }
    createReturn(
      {
        storeId,
        request: {
          saleId: sale!.id,
          items: selectedItems.map((i) => ({
            saleItemId: i.id,
            quantity: rowState[i.id].quantity,
            reason: rowState[i.id].reason,
          })),
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          notification.success({ message: 'Return processed successfully' });
          onClose();
        },
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Return failed', description: message });
        },
      }
    );
  };

  // ── Lookup phase ─────────────────────────────────────────
  const lookupContent = (
    <>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by transaction ID"
        value={txnSearch}
        onChange={(e) => setTxnSearch(e.target.value)}
        style={{ marginBottom: 12 }}
        allowClear
      />
      <Table
        rowKey="id"
        size="small"
        loading={loadingSales || loadingSale}
        dataSource={filteredSales}
        pagination={false}
        scroll={{ y: 320 }}
        columns={[
          { title: 'Transaction ID', dataIndex: 'transactionId', width: 180 },
          { title: 'Items', dataIndex: 'itemCount', width: 60 },
          {
            title: 'Total (₹)',
            dataIndex: 'netAmount',
            width: 100,
            render: (v: number) => `₹${v.toFixed(2)}`,
          },
          {
            title: 'Date',
            dataIndex: 'createdAt',
            width: 130,
            render: (d: string) => new Date(d).toLocaleDateString('en-IN'),
          },
          {
            title: '',
            key: 'action',
            width: 80,
            render: (_: unknown, record: SaleSummaryResponse) => (
              <Button size="small" onClick={() => handleSelectSale(record.id)}>Select</Button>
            ),
          },
        ]}
        locale={{ emptyText: txnSearch ? 'No matching sales' : 'No recent sales' }}
      />
    </>
  );

  // ── Item selection phase ──────────────────────────────────
  const selectContent = sale && (
    <>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">Sale: </Text>
        <Text strong>{sale.transactionId}</Text>
        <Text type="secondary" style={{ marginLeft: 12 }}>{new Date(sale.createdAt).toLocaleString('en-IN')}</Text>
        <Button type="link" size="small" onClick={() => setPhase('lookup')} style={{ float: 'right' }}>
          ← Change Sale
        </Button>
      </div>

      <Table
        rowKey="id"
        size="small"
        dataSource={sale.items}
        pagination={false}
        columns={[
          {
            title: '',
            key: 'check',
            width: 32,
            render: (_: unknown, record) => (
              <input
                type="checkbox"
                checked={rowState[record.id]?.selected ?? false}
                onChange={(e) => updateRow(record.id, { selected: e.target.checked })}
              />
            ),
          },
          { title: 'Product', dataIndex: 'productName' },
          {
            title: 'Price (₹)',
            dataIndex: 'sellingPrice',
            width: 90,
            render: (v: number) => `₹${v.toFixed(2)}`,
          },
          {
            title: 'Bought',
            dataIndex: 'quantity',
            width: 70,
          },
          {
            title: 'Return Qty',
            key: 'returnQty',
            width: 100,
            render: (_: unknown, record) => (
              <InputNumber
                size="small"
                min={1}
                max={rowState[record.id]?.maxQty ?? record.quantity}
                value={rowState[record.id]?.quantity ?? record.quantity}
                disabled={!rowState[record.id]?.selected}
                onChange={(v) => v && updateRow(record.id, { quantity: v })}
                style={{ width: 80 }}
              />
            ),
          },
          {
            title: 'Reason',
            key: 'reason',
            width: 150,
            render: (_: unknown, record) => (
              <Select
                size="small"
                value={rowState[record.id]?.reason}
                disabled={!rowState[record.id]?.selected}
                onChange={(v) => updateRow(record.id, { reason: v })}
                options={REASON_OPTIONS}
                style={{ width: 140 }}
              />
            ),
          },
        ]}
      />

      <Divider style={{ margin: '12px 0' }} />

      <Form.Item label="Notes" style={{ marginBottom: 8 }}>
        <Input.TextArea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this return"
        />
      </Form.Item>

      {selectedItems.length > 0 && (
        <Alert
          type="info"
          showIcon
          message={`Refund: ₹${refundTotal.toFixed(2)} for ${selectedItems.length} item(s)`}
          style={{ marginTop: 8 }}
        />
      )}
    </>
  );

  return (
    <Modal
      title={phase === 'lookup' ? 'New Return — Find Sale' : 'New Return — Select Items'}
      open={open}
      onCancel={onClose}
      width={680}
      destroyOnHidden
      footer={
        phase === 'select' ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isPending}
              disabled={selectedItems.length === 0}
            >
              Process Return
            </Button>
          </div>
        ) : null
      }
    >
      {phase === 'lookup' ? lookupContent : selectContent}
    </Modal>
  );
};