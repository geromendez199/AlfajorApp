import { useEffect, useMemo, useState } from 'react';
import { Button, Card, PageLayout } from '@alfajor/ui';
import { categories, products, extras } from '../lib/menu';
import { useCartStore, calculateTotal, CartItem } from '../lib/cartStore';
import { Channel } from '@alfajor/types';
import { v4 as uuid } from 'uuid';

type PreparedOrder = {
  id: string;
  number: string;
  channel: Channel;
  total: number;
  customerName?: string;
  contact?: string;
  notes?: string;
  items: CartItem[];
  createdAt: string;
};

const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const channelLabels: Record<Channel, string> = {
  [Channel.COUNTER]: 'Mostrador',
  [Channel.PICKUP]: 'Pickup',
  [Channel.DELIVERY]: 'Delivery'
};

const getItemTotal = (item: CartItem): number => {
  const extrasTotal = item.extras?.reduce((acc, ex) => acc + ex.price * ex.quantity, 0) ?? 0;
  return item.unitPrice * item.qty + extrasTotal * item.qty;
};

type ExtrasModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  onConfirm: (selected: { extraId: string; quantity: number }[]) => void;
};

const buildOrderSummary = (order: PreparedOrder): string => {
  const lines: string[] = [];
  lines.push(`Pedido #${order.number}`);
  lines.push(`Canal: ${channelLabels[order.channel]}`);
  lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString('es-AR')}`);
  if (order.customerName) lines.push(`Cliente: ${order.customerName}`);
  if (order.contact) lines.push(`Contacto: ${order.contact}`);
  if (order.notes) lines.push(`Notas: ${order.notes}`);
  lines.push('Items:');
  order.items.forEach((item) => {
    const extrasTotal = (item.extras?.reduce((acc, ex) => acc + ex.price * ex.quantity, 0) ?? 0) * item.qty;
    const itemTotal = getItemTotal(item);

    lines.push(
      `- ${item.product.name}${item.isCombo ? ' (Combo)' : ''} x${item.qty} · ${formatter.format(itemTotal)}`
    );
    if (item.extras?.length) {
      item.extras.forEach((ex) => {
        lines.push(
          `   · Extra ${ex.name} x${ex.quantity}${item.qty > 1 ? ` (por ${item.qty} uds)` : ''} (${formatter.format(
            ex.price * ex.quantity * item.qty
          )})`
        );
      });
    }
    if (item.notes) lines.push(`   · Nota: ${item.notes}`);
  });
  lines.push(`Total: ${formatter.format(order.total)}`);
  return lines.join('\n');
};

function ExtrasModal({ open, onClose, productId, onConfirm }: ExtrasModalProps) {
  const availableExtras = useMemo(
    () => extras.filter((ex) => ex.isGlobal || ex.productId === productId),
    [productId]
  );
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    setSelected({});
  }, [productId, open]);

  if (!open || !productId) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Extras y modificaciones</h3>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="space-y-2">
          {availableExtras.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between rounded-lg bg-ivory px-3 py-2">
              <div>
                <p className="font-semibold">{extra.name}</p>
                <p className="text-sm text-charcoal/70">{formatter.format(extra.price)}</p>
              </div>
              <input
                type="number"
                min={0}
                className="w-20 rounded border border-primary/40 px-2 py-1"
                value={selected[extra.id] ?? 0}
                onChange={(e) =>
                  setSelected((prev) => ({
                    ...prev,
                    [extra.id]: Number(e.target.value)
                  }))
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              const data = Object.entries(selected)
                .filter(([, qty]) => qty > 0)
                .map(([extraId, quantity]) => ({ extraId, quantity }));
              onConfirm(data);
              onClose();
            }}
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmation({
  order,
  onClose,
  onCopy,
  onShare,
  feedback
}: {
  order: PreparedOrder | null;
  onClose: () => void;
  onCopy: () => Promise<void>;
  onShare: () => Promise<void>;
  feedback: string | null;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase text-secondary">Pedido generado</p>
            <h2 className="text-2xl font-bold text-primary">#{order.number}</h2>
            <p className="text-sm text-charcoal/70">{new Date(order.createdAt).toLocaleString('es-AR')}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Resumen" className="bg-ivory">
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li>
                <span className="font-semibold">Canal:</span> {channelLabels[order.channel]}
              </li>
              {order.customerName ? (
                <li>
                  <span className="font-semibold">Cliente:</span> {order.customerName}
                </li>
              ) : null}
              {order.contact ? (
                <li>
                  <span className="font-semibold">Contacto:</span> {order.contact}
                </li>
              ) : null}
              {order.notes ? (
                <li>
                  <span className="font-semibold">Notas:</span> {order.notes}
                </li>
              ) : null}
              <li>
                <span className="font-semibold">Total:</span> {formatter.format(order.total)}
              </li>
            </ul>
          </Card>
          <Card title="Items" className="bg-white">
            <ul className="space-y-3 text-sm text-charcoal/80">
              {order.items.map((item) => (
                <li key={item.id} className="rounded-lg border border-primary/10 bg-ivory px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary">{item.product.name}</p>
                      <p className="text-xs text-secondary">
                        {item.isCombo ? 'Combo' : 'Solo'} · x{item.qty}
                      </p>
                    </div>
                    <p className="font-semibold">{formatter.format(getItemTotal(item))}</p>
                  </div>
                  {item.extras?.length ? (
                    <ul className="mt-1 text-xs text-charcoal/70">
                      {item.extras.map((ex) => (
                        <li key={ex.id}>
                          + {ex.name} x{ex.quantity} ({formatter.format(ex.price * ex.quantity * item.qty)})
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.notes ? <p className="mt-1 text-xs text-secondary">Nota: {item.notes}</p> : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-charcoal/70">Compartí este resumen para confirmarlo en cocina.</p>
            {feedback ? <p className="text-sm font-semibold text-primary">{feedback}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCopy} className="md:w-auto">
              Copiar resumen
            </Button>
            <Button variant="secondary" onClick={onShare} className="md:w-auto">
              Compartir / Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [itemNotes, setItemNotes] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState<Channel>(Channel.COUNTER);
  const [submittedOrder, setSubmittedOrder] = useState<PreparedOrder | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clear);
  const items = useCartStore((s) => s.items);
  const total = useMemo(() => calculateTotal(items), [items]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.categoryId === selectedCategory && p.isAvailable),
    [selectedCategory]
  );

  const handleAdd = (
    productId: string,
    withCombo = false,
    extrasSelection: { extraId: string; quantity: number }[] = []
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const selection = extrasSelection
      .map(({ extraId, quantity }) => {
        const extra = extras.find((ex) => ex.id === extraId);
        if (!extra) return null;
        return { ...extra, quantity };
      })
      .filter(Boolean) as (typeof extras)[number][];

    const item: CartItem = {
      id: uuid(),
      orderId: 'temp',
      productId: product.id,
      qty: 1,
      notes: itemNotes,
      unitPrice: withCombo && product.priceCombo ? product.priceCombo : product.priceSolo,
      isCombo: withCombo,
      extras: selection,
      product
    };
    addItem(item);
    setItemNotes('');
  };

  const handleGenerateOrder = () => {
    if (!items.length) {
      setFeedback('Agrega al menos un producto al carrito.');
      return;
    }

    const orderItems = items.map((item) => ({
      ...item,
      extras: item.extras?.map((ex) => ({ ...ex })) ?? []
    }));

    const order: PreparedOrder = {
      id: uuid(),
      number: `GH-${Date.now().toString().slice(-6)}`,
      channel,
      total,
      customerName: customerName || undefined,
      contact: contact || undefined,
      notes: orderNotes || undefined,
      items: orderItems,
      createdAt: new Date().toISOString()
    };

    setSubmittedOrder(order);
    setFeedback('Pedido generado. Compartilo o guárdalo para confirmarlo.');
    clearCart();
    setItemNotes('');
    setOrderNotes('');
  };

  const handleCopy = async () => {
    if (!submittedOrder) return;
    const summary = buildOrderSummary(submittedOrder);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        setFeedback('Resumen copiado al portapapeles.');
      } else {
        setFeedback('Tu navegador no permite copiar de forma automática.');
      }
    } catch (error) {
      console.error(error);
      setFeedback('No se pudo copiar; intenta manualmente.');
    }
  };

  const handleShare = async () => {
    if (!submittedOrder) return;
    const summary = buildOrderSummary(submittedOrder);
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        // @ts-expect-error Navigator share is not available in all envs
        await navigator.share({ title: 'Pedido Alfajor', text: summary });
        setFeedback('Pedido compartido.');
        return;
      } catch (error) {
        console.error(error);
        setFeedback('No se pudo compartir, se copiará el resumen.');
      }
    }
    await handleCopy();
  };

  return (
    <PageLayout title="Alfajor POS">
      <div className="mb-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card className="bg-white">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between bg-ivory/70">
                <div>
                  <h3 className="text-lg font-bold text-primary">{product.name}</h3>
                  <p className="text-sm text-charcoal/70">{product.description}</p>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleAdd(product.id, false)}>
                      Solo {formatter.format(product.priceSolo)}
                    </Button>
                    {product.canBeCombo && product.priceCombo ? (
                      <Button variant="secondary" onClick={() => handleAdd(product.id, true)}>
                        Combo {formatter.format(product.priceCombo)}
                      </Button>
                    ) : null}
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedProduct(product.id)}>
                    Extras / notas
                  </Button>
                </div>
              </Card>
            ))}
            {!filteredProducts.length ? (
              <div className="col-span-2 rounded-xl border border-dashed border-primary/20 p-6 text-center text-sm text-charcoal/70">
                No hay productos disponibles en esta categoría.
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Carrito" className="bg-white">
          <div className="mb-3 space-y-2">
            <div>
              <label className="text-sm font-semibold text-primary">Nombre del cliente</label>
              <input
                className="mt-1 w-full rounded-lg border border-primary/30 p-2"
                placeholder="Consumidor final"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-primary">Contacto (tel / mesa)</label>
              <input
                className="mt-1 w-full rounded-lg border border-primary/30 p-2"
                placeholder="WhatsApp, mesa o retiro"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-sm font-semibold text-primary">Notas para el pedido</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-primary/30 p-2"
              maxLength={180}
              placeholder="Aclaraciones generales (sin cebolla, agregar servilletas, etc.)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="text-sm font-semibold text-primary">Canal</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.values(Channel).map((ch) => (
                <Button key={ch} variant={channel === ch ? 'secondary' : 'ghost'} onClick={() => setChannel(ch)}>
                  {channelLabels[ch as Channel]}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-primary/20 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-primary">{item.product.name}</p>
                    {item.isCombo ? <p className="text-xs text-secondary">Combo</p> : null}
                    {item.notes ? <p className="text-xs text-secondary">Nota: {item.notes}</p> : null}
                    {item.extras?.length ? (
                      <ul className="mt-1 text-xs text-charcoal/70">
                        {item.extras.map((ex) => (
                          <li key={ex.id}>
                            + {ex.name} x{ex.quantity} ({formatter.format(ex.price * ex.quantity * item.qty)})
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatter.format(getItemTotal(item))}</p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <Button variant="ghost" onClick={() => updateQuantity(item.id, -1)} aria-label="Disminuir">
                        -
                      </Button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold">{item.qty}</span>
                      <Button variant="ghost" onClick={() => updateQuantity(item.id, 1)} aria-label="Aumentar">
                        +
                      </Button>
                    </div>
                    <Button variant="ghost" onClick={() => removeItem(item.id)} className="mt-1 text-sm">
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!items.length ? (
              <div className="rounded-lg border border-dashed border-primary/20 p-4 text-center text-sm text-charcoal/70">
                Todavía no agregaste productos.
              </div>
            ) : null}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Total</span>
              <span>{formatter.format(total)}</span>
            </div>
            <div>
              <label className="text-sm font-semibold text-primary">Notas para el próximo item</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-primary/30 p-2"
                maxLength={120}
                placeholder="Se adjuntará al producto que agregues"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleGenerateOrder}
              disabled={!items.length}
            >
              Confirmar y compartir pedido
            </Button>
            {feedback ? <p className="text-sm text-secondary">{feedback}</p> : null}
          </div>
        </Card>
      </div>
      <ExtrasModal
        open={!!selectedProduct}
        productId={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={(selectedExtras) => {
          if (!selectedProduct) return;
          handleAdd(selectedProduct, false, selectedExtras);
        }}
      />
      <OrderConfirmation order={submittedOrder} onClose={() => setSubmittedOrder(null)} onCopy={handleCopy} onShare={handleShare} feedback={feedback} />
    </PageLayout>
  );
}
