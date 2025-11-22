import { useEffect, useMemo, useState } from 'react';
import { Button, Card, PageLayout } from '@alfajor/ui';
import { Channel, OrderStatus } from '@alfajor/types';

type KitchenOrder = {
  id: string;
  number: number;
  status: OrderStatus;
  channel: Channel;
  createdAt: string;
  items: string[];
};

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [OrderStatus.READY]: 'bg-green-100 text-green-800',
  [OrderStatus.DELIVERED]: 'bg-gray-100 text-gray-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
};

export default function KDSPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [wsStatus, setWsStatus] = useState('disconnected');

  useEffect(() => {
    const seedOrders: KitchenOrder[] = [
      {
        id: 'order-1',
        number: 101,
        status: OrderStatus.PENDING,
        channel: Channel.COUNTER,
        createdAt: new Date().toISOString(),
        items: ['Cheese combo', 'Gaseosa']
      }
    ];
    setOrders(seedOrders);

    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;

    const ws = new WebSocket(url);
    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type: string; order: KitchenOrder };
        if (payload.type === 'order_created') {
          setOrders((prev) => [...prev, payload.order]);
        }
        if (payload.type === 'order_updated') {
          setOrders((prev) => prev.map((o) => (o.id === payload.order.id ? payload.order : o)));
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => ws.close();
  }, []);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [orders]
  );

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <PageLayout title="Alfajor KDS">
      <div className="mb-4 text-sm text-charcoal/70">WebSocket: {wsStatus}</div>
      <div className="grid grid-cols-3 gap-4">
        {sortedOrders.map((order) => (
          <Card key={order.id} className="bg-white">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-lg font-bold text-primary">#{order.number}</p>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-secondary">{order.channel}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-3 flex space-x-2">
              <Button variant="secondary" onClick={() => updateStatus(order.id, OrderStatus.IN_PROGRESS)}>
                Preparando
              </Button>
              <Button onClick={() => updateStatus(order.id, OrderStatus.READY)}>Listo</Button>
            </div>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
