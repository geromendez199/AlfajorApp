import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, PageLayout } from '@alfajor/ui';
import { Category, Product } from '@alfajor/types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productSort, setProductSort] = useState<'recientes' | 'precio-asc' | 'precio-desc'>('recientes');
  const [productSearch, setProductSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryValidation, setCategoryValidation] = useState('');
  const [productValidation, setProductValidation] = useState('');

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      }),
    []
  );

  const resetMessages = useCallback(() => {
    setInfoMessage('');
    setErrorMessage('');
    setCategoryValidation('');
    setProductValidation('');
  }, []);

  const handleResponse = useCallback(async <T,>(res: Response) => {
    if (!res.ok) {
      const errorText = await res.text();
      const readable = errorText || 'Error al comunicarse con la API';
      throw new Error(readable);
    }

    return res.json() as Promise<T>;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    resetMessages();
    try {
      const [cats, prods] = await Promise.all([
        fetch(`${apiUrl}/menu/categories`).then((res) => handleResponse<Category[]>(res)),
        fetch(`${apiUrl}/menu/products`).then((res) => handleResponse<Product[]>(res))
      ]);
      setCategories(cats);
      setProducts(prods);
      setProductCategory((current) => current || cats[0]?.id || '');
      setLastUpdatedAt(new Date());
    } catch (error) {
      setErrorMessage('No pudimos cargar los datos. Reintentá en unos segundos.');
      setCategories([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [handleResponse, resetMessages]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validateCategory = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'Ingresá un nombre para la categoría.';
    }

    if (categories.some((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      return 'Ya existe una categoría con ese nombre.';
    }

    return '';
  };

  const addCategory = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateCategory(categoryName);
    setCategoryValidation(validation);
    if (validation) return;

    const trimmedName = categoryName.trim();

    setIsSavingCategory(true);
    resetMessages();

    try {
      const data = await fetch(`${apiUrl}/menu/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      }).then((res) => handleResponse<Category>(res));

      setCategories((prev) => [...prev, data]);
      setCategoryName('');
      setInfoMessage('Categoría creada correctamente.');
    } catch (error) {
      setErrorMessage('No pudimos crear la categoría. Verificá la información e intentá de nuevo.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const validateProduct = (name: string, price: string, categoryId: string) => {
    const trimmedName = name.trim();
    const priceValue = Number(price);

    if (!trimmedName) {
      return 'Ingresá un nombre para el producto.';
    }

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      return 'Ingresá un precio válido mayor a cero.';
    }

    if (!categoryId) {
      return 'Seleccioná la categoría del producto.';
    }

    return '';
  };

  const addProduct = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateProduct(productName, productPrice, productCategory);
    setProductValidation(validation);
    if (validation) return;

    const trimmedName = productName.trim();
    const priceValue = Number(productPrice);

    setIsSavingProduct(true);
    resetMessages();

    try {
      const data = await fetch(`${apiUrl}/menu/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, priceSolo: priceValue, categoryId: productCategory })
      }).then((res) => handleResponse<Product>(res));

      setProducts((prev) => [...prev, data]);
      setProductName('');
      setProductPrice('');
      setProductCategory(categories[0]?.id || '');
      setInfoMessage('Producto agregado correctamente.');
    } catch (error) {
      setErrorMessage('No pudimos agregar el producto. Revisa los datos e intentá nuevamente.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const byCategory = productCategoryFilter
      ? products.filter((prod) => prod.categoryId === productCategoryFilter)
      : products;

    const bySearch = productSearch
      ? byCategory.filter((prod) => prod.name.toLowerCase().includes(productSearch.toLowerCase()))
      : byCategory;

    const sorted = [...bySearch];
    if (productSort === 'precio-asc') {
      sorted.sort((a, b) => a.priceSolo - b.priceSolo);
    } else if (productSort === 'precio-desc') {
      sorted.sort((a, b) => b.priceSolo - a.priceSolo);
    } else {
      sorted.sort((a, b) => b.id.toString().localeCompare(a.id.toString()));
    }

    return sorted;
  }, [productCategoryFilter, productSearch, productSort, products]);

  const productStats = useMemo(() => {
    const total = filteredProducts.reduce((sum, prod) => sum + prod.priceSolo, 0);
    const average = filteredProducts.length ? total / filteredProducts.length : 0;
    const max = filteredProducts.reduce<number | null>((current, prod) => {
      if (current === null || prod.priceSolo > current) return prod.priceSolo;
      return current;
    }, null);

    return {
      total,
      average,
      max
    };
  }, [filteredProducts]);

  return (
    <PageLayout title="Alfajor Admin">
      <div className="space-y-6">
        <header className="rounded-xl bg-gradient-to-r from-primary/10 via-ivory to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-charcoal">Panel de menú</h1>
              <p className="mt-2 text-sm text-charcoal/70">
                Gestioná categorías y productos con feedback inmediato y validaciones claras.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-charcoal/80">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  {categories.length} categorías
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  {products.length} productos
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  {filteredProducts.length} visibles
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Button onClick={loadData} disabled={isLoading} variant="secondary">
                {isLoading ? 'Actualizando…' : 'Refrescar datos'}
              </Button>
              <p className="text-xs text-charcoal/60">
                {lastUpdatedAt ? `Última actualización: ${lastUpdatedAt.toLocaleString('es-AR')}` : 'Aún no cargado'}
              </p>
            </div>
          </div>
        </header>

        {(infoMessage || errorMessage) && (
          <div
            className={`rounded-lg border p-3 text-sm shadow-sm ${
              errorMessage
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
            role="status"
            aria-live="polite"
          >
            {errorMessage || infoMessage}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Categorías">
            <form className="space-y-3" onSubmit={addCategory}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-charcoal">Nombre de categoría</label>
                <input
                  className="w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej: Alfajores clásicos"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  disabled={isSavingCategory}
                />
                {categoryValidation && <p className="text-xs text-red-600">{categoryValidation}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSavingCategory}>
                  {isSavingCategory ? 'Creando…' : 'Crear categoría'}
                </Button>
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => setCategoryName('')}
                  disabled={isSavingCategory}
                >
                  Limpiar
                </button>
              </div>
            </form>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-charcoal/60">
                <span>Categoría</span>
                <span>ID</span>
              </div>
              <div className="space-y-2 rounded-lg border border-ivory bg-white p-3 shadow-inner">
                {isLoading && <p className="text-sm text-charcoal/70">Cargando categorías…</p>}
                {!isLoading && categories.length === 0 && (
                  <p className="text-sm text-charcoal/70">Todavía no hay categorías cargadas.</p>
                )}
                {!isLoading &&
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded border border-ivory/80 bg-ivory px-3 py-2 text-sm text-charcoal"
                    >
                      <div>
                        <span className="font-medium">{cat.name}</span>
                        <p className="text-xs text-charcoal/60">{products.filter((p) => p.categoryId === cat.id).length} productos</p>
                      </div>
                      <span className="text-xs text-charcoal/60">{cat.id}</span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <Card title="Productos">
            <form className="space-y-3" onSubmit={addProduct}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-charcoal">Nombre del producto</label>
                <input
                  className="w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej: Alfajor de maicena"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isSavingProduct}
                />
                {productValidation && <p className="text-xs text-red-600">{productValidation}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-charcoal">Precio</label>
                  <input
                    type="number"
                    className="w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ej: 1500"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    min={0}
                    step="0.01"
                    disabled={isSavingProduct}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-charcoal">Categoría</label>
                  <select
                    className="w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    disabled={isSavingProduct}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSavingProduct}>
                  {isSavingProduct ? 'Guardando…' : 'Agregar producto'}
                </Button>
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => {
                    setProductName('');
                    setProductPrice('');
                    setProductCategory(categories[0]?.id || '');
                  }}
                  disabled={isSavingProduct}
                >
                  Limpiar
                </button>
              </div>
            </form>

            <div className="mt-4 grid gap-3 rounded-lg border border-ivory bg-ivory/70 p-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-charcoal/60">Total de productos</p>
                <p className="text-lg font-semibold text-charcoal">{filteredProducts.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-charcoal/60">Ticket promedio</p>
                <p className="text-lg font-semibold text-charcoal">{priceFormatter.format(productStats.average || 0)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-charcoal/60">Precio más alto</p>
                <p className="text-lg font-semibold text-charcoal">
                  {productStats.max ? priceFormatter.format(productStats.max) : 'Sin datos'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-charcoal">Buscar producto</label>
                <input
                  className="mt-1 w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nombre del producto"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal">Orden</label>
                <select
                  className="mt-1 w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value as typeof productSort)}
                >
                  <option value="recientes">Más recientes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal">Filtrar por categoría</label>
                <select
                  className="mt-1 w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal">Categoría por defecto</label>
                <select
                  className="mt-1 w-full rounded border border-primary/30 p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  disabled={isSavingProduct}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-charcoal/60">
                <span>Producto</span>
                <span>Precio</span>
              </div>
              <div className="space-y-2 rounded-lg border border-ivory bg-white p-3 shadow-inner">
                {isLoading && <p className="text-sm text-charcoal/70">Cargando productos…</p>}
                {!isLoading && products.length === 0 && (
                  <p className="text-sm text-charcoal/70">Todavía no hay productos cargados.</p>
                )}
                {!isLoading && filteredProducts.length === 0 && products.length > 0 && (
                  <p className="text-sm text-charcoal/70">No hay productos que coincidan con el filtro.</p>
                )}
                {!isLoading &&
                  filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between rounded border border-ivory/80 bg-ivory px-3 py-2 text-sm text-charcoal"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold">{prod.name}</p>
                        <p className="text-xs text-charcoal/60">ID: {prod.id}</p>
                        <p className="text-xs text-charcoal/60">
                          {categories.find((cat) => cat.id === prod.categoryId)?.name || 'Sin categoría'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {priceFormatter.format(prod.priceSolo)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
