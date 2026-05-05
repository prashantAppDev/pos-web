import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button, Card, Col, DatePicker, Divider, Row,
  Select, Space, Statistic, Switch, Table, Tabs, Tag, Typography, notification,
} from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useSalesReport, useTopProductsReport } from '../hooks/useReports';
import { exportSalesReport, exportTopProductsReport } from '../api/report.api';
import type { PaymentMethodBreakdown, ProductSalesRow, SaleTransactionRow } from '../../../types/report.types';
import type { PaymentMethod } from '../../../types/sale.types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PAYMENT_METHOD_COLOR: Record<PaymentMethod, string> = {
  CASH: 'green',
  UPI: 'blue',
  CARD: 'purple',
};

const fmt = (n: number) => `₹${n.toFixed(2)}`;

// ── Sales Report Tab ────────────────────────────────────────────

const SalesReportTab = ({ storeId }: { storeId: string }) => {
  const today = dayjs();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([today.startOf('month'), today]);
  const [detail, setDetail] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const params = {
    from: range[0].format('YYYY-MM-DD'),
    to: range[1].format('YYYY-MM-DD'),
    detail,
  };

  const { data: report, isFetching, refetch } = useSalesReport(storeId, params, true);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      await exportSalesReport(storeId, params, format);
    } catch {
      notification.error({ message: 'Export failed', description: 'Could not download the report' });
    } finally {
      setExporting(null);
    }
  };

  const paymentMethodColumns = [
    {
      title: 'Payment Method',
      dataIndex: 'method',
      render: (m: PaymentMethod) => <Tag color={PAYMENT_METHOD_COLOR[m]}>{m}</Tag>,
    },
    { title: 'Transactions', dataIndex: 'count', width: 120 },
    { title: 'Amount', dataIndex: 'amount', width: 140, render: (v: number) => fmt(v) },
  ];

  const transactionColumns = [
    { title: 'Transaction ID', dataIndex: 'transactionId', width: 180 },
    {
      title: 'Date/Time',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => dayjs(v).format('DD MMM YYYY HH:mm'),
    },
    { title: 'Items', dataIndex: 'itemCount', width: 70 },
    { title: 'Tax', dataIndex: 'taxAmount', width: 100, render: (v: number) => fmt(v) },
    { title: 'Total', dataIndex: 'totalAmount', width: 110, render: (v: number) => fmt(v) },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      width: 100,
      render: (m: PaymentMethod) => <Tag color={PAYMENT_METHOD_COLOR[m]}>{m}</Tag>,
    },
  ];

  const s = report?.summary;

  return (
    <div>
      {/* Controls */}
      <Space wrap style={{ marginBottom: 20 }}>
        <RangePicker
          value={range}
          onChange={(dates) => {
            if (dates?.[0] && dates?.[1]) setRange([dates[0], dates[1]]);
          }}
          allowClear={false}
          format="DD MMM YYYY"
        />
        <Space>
          <Text>Transaction detail</Text>
          <Switch checked={detail} onChange={setDetail} size="small" />
        </Space>
        <Button type="primary" onClick={() => refetch()} loading={isFetching}>
          Run Report
        </Button>
        <Button
          icon={<FilePdfOutlined />}
          loading={exporting === 'pdf'}
          onClick={() => handleExport('pdf')}
          disabled={!report}
        >
          Export PDF
        </Button>
        <Button
          icon={<FileExcelOutlined />}
          loading={exporting === 'excel'}
          onClick={() => handleExport('excel')}
          disabled={!report}
        >
          Export Excel
        </Button>
      </Space>

      {report && (
        <>
          {/* Summary cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic title="Transactions" value={s?.totalTransactions ?? 0} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic title="Revenue" value={s?.totalRevenue ?? 0} prefix="₹" precision={2} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic title="Tax" value={s?.totalTax ?? 0} prefix="₹" precision={2} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="Returns"
                  value={s?.totalReturns ?? 0}
                  prefix="₹"
                  precision={2}
                  // eslint-disable-next-line @typescript-eslint/no-deprecated
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={s?.returnCount ? <Text type="secondary" style={{ fontSize: 12 }}>({s.returnCount})</Text> : undefined}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="Net Revenue"
                  value={s?.netRevenue ?? 0}
                  prefix="₹"
                  precision={2}
                  // eslint-disable-next-line @typescript-eslint/no-deprecated
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Payment method breakdown */}
          <Title level={5} style={{ marginBottom: 8 }}>By Payment Method</Title>
          <Table<PaymentMethodBreakdown>
            rowKey="method"
            columns={paymentMethodColumns}
            dataSource={s?.byPaymentMethod ?? []}
            pagination={false}
            size="small"
            style={{ marginBottom: 24, maxWidth: 460 }}
          />

          {/* Transaction detail */}
          {detail && report.transactions && (
            <>
              <Divider />
              <Title level={5} style={{ marginBottom: 8 }}>
                Transactions ({report.transactions.length})
              </Title>
              <Table<SaleTransactionRow>
                rowKey="transactionId"
                columns={transactionColumns}
                dataSource={report.transactions}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} transactions` }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

// ── Top Products Tab ────────────────────────────────────────────

const TopProductsTab = ({ storeId }: { storeId: string }) => {
  const today = dayjs();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([today.startOf('month'), today]);
  const [limit, setLimit] = useState(20);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const params = {
    from: range[0].format('YYYY-MM-DD'),
    to: range[1].format('YYYY-MM-DD'),
    limit,
  };

  const { data: report, isFetching, refetch } = useTopProductsReport(storeId, params, true);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      await exportTopProductsReport(storeId, params, format);
    } catch {
      notification.error({ message: 'Export failed', description: 'Could not download the report' });
    } finally {
      setExporting(null);
    }
  };

  const columns = [
    { title: '#', key: 'rank', width: 50, render: (_: unknown, __: ProductSalesRow, i: number) => i + 1 },
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, record: ProductSalesRow) => (
        <div>
          <div>{record.productName}</div>
          {record.barcode && <Text type="secondary" style={{ fontSize: 11 }}>{record.barcode}</Text>}
        </div>
      ),
    },
    { title: 'Qty Sold', dataIndex: 'totalQuantitySold', width: 100, render: (v: number) => v.toFixed(2) },
    { title: 'Revenue', dataIndex: 'totalRevenue', width: 120, render: (v: number) => fmt(v) },
    { title: 'Transactions', dataIndex: 'transactionCount', width: 120 },
  ];

  return (
    <div>
      {/* Controls */}
      <Space wrap style={{ marginBottom: 20 }}>
        <RangePicker
          value={range}
          onChange={(dates) => {
            if (dates?.[0] && dates?.[1]) setRange([dates[0], dates[1]]);
          }}
          allowClear={false}
          format="DD MMM YYYY"
        />
        <Space>
          <Text>Top</Text>
          <Select
            value={limit}
            onChange={setLimit}
            options={[
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 },
              { label: '100', value: 100 },
            ]}
            style={{ width: 80 }}
          />
          <Text>products</Text>
        </Space>
        <Button type="primary" onClick={() => refetch()} loading={isFetching}>
          Run Report
        </Button>
        <Button
          icon={<FilePdfOutlined />}
          loading={exporting === 'pdf'}
          onClick={() => handleExport('pdf')}
          disabled={!report}
        >
          Export PDF
        </Button>
        <Button
          icon={<FileExcelOutlined />}
          loading={exporting === 'excel'}
          onClick={() => handleExport('excel')}
          disabled={!report}
        >
          Export Excel
        </Button>
      </Space>

      {report && (
        <Table<ProductSalesRow>
          rowKey="productId"
          columns={columns}
          dataSource={report.products}
          size="small"
          pagination={false}
          locale={{ emptyText: 'No sales data for this period' }}
        />
      )}
    </div>
  );
};

// ── Page ────────────────────────────────────────────────────────

export const ReportsPage = () => {
  const { storeId } = useParams<{ storeId: string }>();

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 20px' }}>Reports</Title>
      <Tabs
        defaultActiveKey="sales"
        items={[
          {
            key: 'sales',
            label: 'Sales Report',
            children: <SalesReportTab storeId={storeId!} />,
          },
          {
            key: 'top-products',
            label: 'Top Products',
            children: <TopProductsTab storeId={storeId!} />,
          },
        ]}
      />
    </div>
  );
};
