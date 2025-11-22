import { useMemo, useState } from 'react';
import { Button, Card, PageLayout } from '@alfajor/ui';
import { categories, products, extras } from '../lib/menu';
import { useCartStore, calculateTotal, CartItem } from '../lib/cartStore';
import { Channel } from '@alfajor/types';
import { v4 as uuid } from 'uuid';

const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

type ExtrasModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  onConfirm: (selected: { extraId: string; quantity: number }[]) => void;
};

function ExtrasModal({ open, onClose, productId, onConfirm }: ExtrasModalProps) {
  const availableExtras = useMemo(
    () => extras.filter((ex) => ex.isGlobal || ex.productId === productId),
    [productId]
  );
  const [selected, setSelected] = useState<Record<string, number>>({});

  if (!open || !productId) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
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

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [channel, setChannel] = useState<Channel>(Channel.COUNTER);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const items = useCartStore((s) => s.items);
  const total = useMemo(() => calculateTotal(items), [items]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.categoryId === selectedCategory && p.isAvailable),
    [selectedCategory]
  );

  const handleAdd = (productId: string, withCombo = false, extrasSelection: { extraId: string; quantity: number }[] = []) => {
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
      notes,
      unitPrice: withCombo && product.priceCombo ? product.priceCombo : product.priceSolo,
      isCombo: withCombo,
      extras: selection,
      product
    };
    addItem(item);
    setNotes('');
  };

  return (
    <PageLayout title="Alfajor POS">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="flex space-x-2">
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
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between bg-white">
                <div>
                  <h3 className="text-lg font-bold text-primary">{product.name}</h3>
                  <p className="text-sm text-charcoal/70">{product.description}</p>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button onClick={() => handleAdd(product.id, false)}>Solo {formatter.format(product.priceSolo)}</Button>
                    {product.canBeCombo && product.priceCombo && (
                      <Button variant="secondary" onClick={() => handleAdd(product.id, true)}>
                        Combo {formatter.format(product.priceCombo)}
                      </Button>
                    )}
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedProduct(product.id)}>
                    Extras / notas
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <Card title="Carrito" className="bg-white">
          <div className="mb-3">
            <label className="text-sm font-semibold text-primary">Notas generales</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-primary/30 p-2"
              maxLength={120}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="text-sm font-semibold text-primary">Canal</label>
            <div className="mt-2 flex space-x-2">
              {Object.values(Channel).map((ch) => (
                <Button key={ch} variant={channel === ch ? 'secondary' : 'ghost'} onClick={() => setChannel(ch)}>
                  {ch}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-primary/20 p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary">{item.product.name}</p>
                    {item.isCombo && <p className="text-xs text-secondary">Combo</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatter.format(item.unitPrice)}</p>
                    <Button variant="ghost" onClick={() => removeItem(item.id)}>
                      Quitar
                    </Button>
                  </div>
                </div>
                {item.extras?.length ? (
                  <ul className="mt-1 text-sm text-charcoal/70">
                    {item.extras.map((ex) => (
                      <li key={ex.id}>
                        + {ex.name} x{ex.quantity} ({formatter.format(ex.price * ex.quantity)})
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.notes && <p className="mt-1 text-xs text-secondary">Nota: {item.notes}</p>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-lg font-bold text-primary">
            <span>Total</span>
            <span>{formatter.format(total)}</span>
          </div>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => alert('Orden enviada a cocina')}>
            Enviar a cocina
          </Button>
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
    </PageLayout>
  );
}
