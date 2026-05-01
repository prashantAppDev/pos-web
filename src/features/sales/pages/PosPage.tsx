import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Button, Col, Divider, InputNumber, Modal, notification,
  Radio, Row, Select, Spin, Table, Typography,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { searchProducts } from '../../products/api/product.api';
import { getProductBatches } from '../../inventory/api/inventory.api';
import { useCreateSale } from '../hooks/useSales';
import { useCounterList } from '../../stores/hooks/useCounters';
import { SaleReceiptModal } from '../components/SaleReceiptModal';
import type { BatchResponse } from '../../../types/inventory.types';
import type { CartItem, PaymentMethod, SaleResponse } from '../../../types/sale.types';

const { Title, Text } = Typography;

export const PosPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [counterId, setCounterId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [upiRef, setUpiRef] = useState('');
  const [cashTendered, setCashTendered] = useState<number | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleResponse | null>(null);
  const [completedCart, setCompletedCart] = useState<CartItem[]>([]);

  // Multi-MRP picker state
  const [batchPickerOpen, setBatchPickerOpen] = useState(false);
  const [pendingBatches, setPendingBatches] = useState<{ productId: string; productName: string; barcode: string | null; batches: BatchResponse[] } | null>(null);
  const [selectedMrp, setSelectedMrp] = useState<number | null>(null);

  const { data: countersPage } = useCounterList(storeId!, { page: 0, size: 100, isActive: true });
  const activeCounters = countersPage?.content ?? [];
  const { mutate: createSale, isPending: placing } = useCreateSale();

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const grandTotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const change = cashTendered != null ? cashTendered - grandTotal : null;

  const addBatchToCart = (productId: string, productName: string, barcode: string | null, batch: BatchResponse, allSameMrpBatches: BatchResponse[]) => {
    const availableQty = allSameMrpBatches.reduce((s, b) => s + b.quantityRemaining, 0);
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId && c.mrp === batch.mrp);
      if (existing) {
        return prev.map((c) =>
          c.productId === productId && c.mrp === batch.mrp
            ? { ...c, quantity: Math.min(c.quantity + 1, c.availableQty) }
            : c
        );
      }
      return [...prev, { productId, productName, barcode, mrp: batch.mrp, sellingPrice: batch.sellingPrice, quantity: 1, availableQty }];
    });
    setBarcodeInput('');
    setTimeout(() => barcodeRef.current?.focus(), 50);
  };

  const handleScan = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    setScanning(true);
    try {
      const results = await searchProducts(barcode);
      const product = results.find((p) => p.barcode === barcode);
      if (!product) {
        notification.warning({ message: 'Product not found', description: `No product with barcode "${barcode}"` });
        setScanning(false);
        return;
      }

      const batches = await getProductBatches(storeId!, product.id);
      const available = batches.filter((b) => b.quantityRemaining > 0);
      if (available.length === 0) {
        notification.error({ message: 'Out of stock', description: `${product.name} is out of stock` });
        setScanning(false);
        return;
      }

      // Group by MRP
      const mrps = [...new Set(available.map((b) => b.mrp))];
      if (mrps.length === 1) {
        const sameMrp = available.filter((b) => b.mrp === mrps[0]);
        addBatchToCart(product.id, product.name, product.barcode, sameMrp[0], sameMrp);
      } else {
        setPendingBatches({ productId: product.id, productName: product.name, barcode: product.barcode, batches: available });
        setSelectedMrp(mrps[0]);
        setBatchPickerOpen(true);
      }
    } catch {
      notification.error({ message: 'Lookup failed', description: 'Could not fetch product data' });
    } finally {
      setScanning(false);
    }
  };

  const handlePickMrp = () => {
    if (!pendingBatches || selectedMrp == null) return;
    const sameMrp = pendingBatches.batches.filter((b) => b.mrp === selectedMrp);
    addBatchToCart(pendingBatches.productId, pendingBatches.productName, pendingBatches.barcode, sameMrp[0], sameMrp);
    setBatchPickerOpen(false);
    setPendingBatches(null);
  };

  const updateQty = (productId: string, mrp: number, qty: number | null) => {
    if (!qty || qty < 1) return;
    setCart((prev) =>
      prev.map((c) => c.productId === productId && c.mrp === mrp ? { ...c, quantity: qty } : c)
    );
  };

  const removeItem = (productId: string, mrp: number) => {
    setCart((prev) => prev.filter((c) => !(c.productId === productId && c.mrp === mrp)));
  };

  const handlePlaceOrder = () => {
    if (!counterId || cart.length === 0) return;
    createSale(
      {
        storeId: storeId!,
        request: {
          counterId,
          items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity, mrp: c.mrp })),
          paymentMethod,
          upiRefNumber: paymentMethod === 'UPI' && upiRef ? upiRef : undefined,
        },
      },
      {
        onSuccess: (sale) => {
          setCompletedCart([...cart]);
          setCompletedSale(sale);
        },
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Sale failed', description: message });
        },
      }
    );
  };

  const handleNewSale = () => {
    setCart([]);
    setCounterId(undefined);
    setPaymentMethod('CASH');
    setUpiRef('');
    setCashTendered(null);
    setCompletedSale(null);
    setCompletedCart([]);
    setTimeout(() => barcodeRef.current?.focus(), 50);
  };

  const cartColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, record: CartItem) => (
        <div>
          <div>{record.productName}</div>
          {record.barcode && <Text type="secondary" style={{ fontSize: 11 }}>{record.barcode}</Text>}
        </div>
      ),
    },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      width: 90,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    {
      title: 'Price (₹)',
      dataIndex: 'sellingPrice',
      width: 90,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    {
      title: 'Qty',
      key: 'qty',
      width: 110,
      render: (_: unknown, record: CartItem) => (
        <InputNumber
          min={1}
          max={record.availableQty}
          value={record.quantity}
          onChange={(v) => updateQty(record.productId, record.mrp, v)}
          size="small"
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: 'Total (₹)',
      key: 'total',
      width: 100,
      render: (_: unknown, record: CartItem) => `₹${(record.sellingPrice * record.quantity).toFixed(2)}`,
    },
    {
      title: '',
      key: 'remove',
      width: 40,
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => removeItem(record.productId, record.mrp)}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>POS — New Sale</Title>

      <Row gutter={24}>
        {/* ── Cart panel ─────────────────────────────── */}
        <Col xs={24} lg={15}>
          {/* Barcode input */}
          <div style={styles.barcodeRow}>
            <input
              ref={barcodeRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleScan(); }}
              placeholder="Scan barcode or type and press Enter"
              style={styles.barcodeInput}
              disabled={scanning}
            />
            <Button onClick={handleScan} loading={scanning} type="default">
              Add
            </Button>
          </div>

          <Table
            rowKey={(r) => `${r.productId}-${r.mrp}`}
            columns={cartColumns}
            dataSource={cart}
            pagination={false}
            size="small"
            locale={{ emptyText: 'Cart is empty — scan a barcode to start' }}
          />
        </Col>

        {/* ── Payment panel ───────────────────────────── */}
        <Col xs={24} lg={9}>
          <div style={styles.paymentCard}>
            <div style={styles.paymentRow}>
              <Text>Counter</Text>
              <Select
                value={counterId}
                onChange={setCounterId}
                placeholder="Select counter"
                style={{ width: 160 }}
                options={activeCounters.map((c) => ({ label: c.name, value: c.id }))}
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={styles.totalRow}>
              <Text>Items</Text>
              <Text>{cart.reduce((s, c) => s + c.quantity, 0)}</Text>
            </div>
            <div style={{ ...styles.totalRow, marginTop: 8 }}>
              <Text strong style={{ fontSize: 18 }}>Total</Text>
              <Text strong style={{ fontSize: 22 }}>₹{grandTotal.toFixed(2)}</Text>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Text type="secondary" style={{ fontSize: 12 }}>Payment Method</Text>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 12 }}
            >
              <Radio.Button value="CASH">Cash</Radio.Button>
              <Radio.Button value="UPI">UPI</Radio.Button>
              <Radio.Button value="CARD">Card</Radio.Button>
            </Radio.Group>

            {paymentMethod === 'UPI' && (
              <div style={styles.paymentRow}>
                <Text>UPI Ref</Text>
                <input
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  placeholder="Optional"
                  style={{ ...styles.barcodeInput, width: 160, fontSize: 13 }}
                />
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div style={styles.paymentRow}>
                <Text>Cash Tendered</Text>
                <InputNumber
                  value={cashTendered}
                  onChange={setCashTendered}
                  min={0}
                  precision={2}
                  prefix="₹"
                  style={{ width: 130 }}
                  placeholder="0.00"
                />
              </div>
            )}

            {paymentMethod === 'CASH' && change != null && (
              <div style={{ ...styles.paymentRow, marginTop: 8 }}>
                <Text>Change</Text>
                <Text strong style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  ₹{change >= 0 ? change.toFixed(2) : '—'}
                </Text>
              </div>
            )}

            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: 20 }}
              disabled={!counterId || cart.length === 0}
              loading={placing}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </div>
        </Col>
      </Row>

      {/* Multi-MRP picker */}
      <Modal
        title="Multiple prices available — select MRP"
        open={batchPickerOpen}
        onOk={handlePickMrp}
        onCancel={() => { setBatchPickerOpen(false); setBarcodeInput(''); setTimeout(() => barcodeRef.current?.focus(), 50); }}
        okText="Add to Cart"
        destroyOnHidden
      >
        {pendingBatches && (
          <>
            <Text strong>{pendingBatches.productName}</Text>
            <Radio.Group
              value={selectedMrp}
              onChange={(e) => setSelectedMrp(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}
            >
              {[...new Set(pendingBatches.batches.map((b) => b.mrp))].map((mrp) => {
                const b = pendingBatches.batches.find((x) => x.mrp === mrp)!;
                const qty = pendingBatches.batches.filter((x) => x.mrp === mrp).reduce((s, x) => s + x.quantityRemaining, 0);
                return (
                  <Radio key={mrp} value={mrp}>
                    MRP ₹{mrp.toFixed(2)} · Price ₹{b.sellingPrice.toFixed(2)} · {qty} in stock
                  </Radio>
                );
              })}
            </Radio.Group>
          </>
        )}
      </Modal>

      {completedSale && (
        <SaleReceiptModal
          open={!!completedSale}
          sale={completedSale}
          cartItems={completedCart}
          onNewSale={handleNewSale}
        />
      )}
    </div>
  );
};

const styles = {
  barcodeRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  barcodeInput: {
    flex: 1,
    padding: '6px 11px',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  },
  paymentCard: {
    background: '#fafafa',
    border: '1px solid #f0f0f0',
    borderRadius: 8,
    padding: 20,
  },
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};