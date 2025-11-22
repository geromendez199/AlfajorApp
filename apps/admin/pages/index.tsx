import { FormEvent, useEffect, useState } from 'react';
import { Button, Card, PageLayout } from '@alfajor/ui';
import { Category, Product } from '@alfajor/types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [productCategory, setProductCategory] = useState('');

  useEffect(() => {
    fetch(`${apiUrl}/menu/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
    fetch(`${apiUrl}/menu/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const addCategory = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/menu/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName })
    });
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) => [...prev, data]);
      setCategoryName('');
    }
  };

  const addProduct = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/menu/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: productName, priceSolo: productPrice, categoryId: productCategory })
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => [...prev, data]);
      setProductName('');
      setProductPrice(0);
    }
  };

  return (
    <PageLayout title="Alfajor Admin">
      <div className="grid grid-cols-2 gap-4">
        <Card title="Categorías">
          <form className="space-y-2" onSubmit={addCategory}>
            <input
              className="w-full rounded border border-primary/30 p-2"
              placeholder="Nombre de categoría"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Button type="submit">Crear</Button>
          </form>
          <ul className="mt-4 space-y-1">
            {categories.map((cat) => (
              <li key={cat.id} className="rounded bg-ivory px-3 py-2">
                {cat.name}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Productos">
          <form className="space-y-2" onSubmit={addProduct}>
            <input
              className="w-full rounded border border-primary/30 p-2"
              placeholder="Nombre del producto"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="number"
              className="w-full rounded border border-primary/30 p-2"
              placeholder="Precio"
              value={productPrice}
              onChange={(e) => setProductPrice(Number(e.target.value))}
            />
            <select
              className="w-full rounded border border-primary/30 p-2"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button type="submit">Agregar</Button>
          </form>
          <ul className="mt-4 space-y-1">
            {products.map((prod) => (
              <li key={prod.id} className="rounded bg-ivory px-3 py-2">
                {prod.name} – ${prod.priceSolo}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageLayout>
  );
}
