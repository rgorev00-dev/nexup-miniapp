import { useEffect, useState } from "react";
import "./App.css";

type Product = {
  id: string | number;
  name?: string;
  title?: string;
  price: number;
};

type CatalogResponse = {
  currency?: string;
  products: Product[];
};

type Tab = "home" | "catalog" | "orders" | "profile";

const fallbackProducts: Product[] = [
  { id: "60", name: "60 UC", price: 99 },
  { id: "120", name: "120 UC", price: 179 },
  { id: "180", name: "180 UC", price: 249 },
  { id: "325", name: "325 UC", price: 449 },
  { id: "385", name: "385 UC", price: 529 },
  { id: "660", name: "660 UC", price: 899 },
  { id: "720", name: "720 UC", price: 979 },
  { id: "985", name: "985 UC", price: 1299 },
  { id: "1320", name: "1320 UC", price: 1699 },
  { id: "1800", name: "1800 UC", price: 2199 },
  { id: "2125", name: "2125 UC", price: 2599 },
  { id: "2460", name: "2460 UC", price: 2999 },
  { id: "3850", name: "3850 UC", price: 4399 },
  { id: "4510", name: "4510 UC", price: 5199 },
  { id: "5650", name: "5650 UC", price: 6499 },
  { id: "8100", name: "8100 UC", price: 8499 },
  { id: "9900", name: "9900 UC", price: 10499 },
  { id: "11950", name: "11950 UC", price: 12499 },
  { id: "16200", name: "16200 UC", price: 16699 },
  { id: "24300", name: "24300 UC", price: 24999 },
  { id: "32400", name: "32400 UC", price: 33399 },
  { id: "40500", name: "40500 UC", price: 41699 },
  { id: "81000", name: "81000 UC", price: 83299 },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU").format(price) + " ₽";

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/catalog", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return response.json() as Promise<CatalogResponse>;
      })
      .then((data) => {
        if (!Array.isArray(data.products)) throw new Error("Invalid catalog response");
        const normalized = data.products.map((item) => ({
          ...item,
          id: String(item.id),
          name: item.name ?? item.title ?? `${item.id} UC`,
          price: Number(item.price),
        }));
        setProducts(normalized);
        setUsingFallback(false);
        setError("");
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setProducts(fallbackProducts);
        setUsingFallback(true);
        setError("Не удалось подключиться к серверу. Показаны сохранённые цены.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const openCatalog = () => {
    setSelectedProduct(null);
    setTab("catalog");
  };

  const renderProducts = (items: Product[]) => {
    if (loading) return <div className="state-message">Загружаем каталог...</div>;
    if (!items.length) return <div className="state-message">В этом разделе пока нет товаров.</div>;

    return (
      <>
        <div className="product-grid">
          {items.map((product) => {
            const productName = product.name ?? product.title ?? `${product.id} UC`;
            return (
              <article className="product-card" key={product.id}>
                <div className="product-art" aria-hidden="true">
                  <span className="product-art-glow" />
                  <span className="product-art-label">UC</span>
                  <span className="product-art-orbit">N</span>
                </div>
                <div className="product-info">
                  <span className="product-name">{productName}</span>
                  <span className="product-caption">PUBG MOBILE</span>
                  <div className="product-bottom">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <button
                      className="add-button"
                      aria-label={`Выбрать ${productName}`}
                      title="Выбрать товар"
                      onClick={() => setSelectedProduct(product)}
                    >+</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {selectedProduct && (
          <div className="selection-backdrop" role="presentation" onClick={() => setSelectedProduct(null)}>
            <section
              className="selection-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Выбранный товар"
              onClick={(event) => event.stopPropagation()}
            >
              <button className="selection-close" onClick={() => setSelectedProduct(null)} aria-label="Закрыть">×</button>
              <span className="section-kicker">ВЫБРАННЫЙ ПАКЕТ</span>
              <h3>{selectedProduct.name ?? selectedProduct.title ?? `${selectedProduct.id} UC`}</h3>
              <p className="selection-price">{formatPrice(selectedProduct.price)}</p>
              <p className="selection-note">Оформление заказа и оплата пока не подключены. Мы подготовим их на следующем этапе.</p>
              <button className="button button-primary button-full" onClick={() => setSelectedProduct(null)}>Понятно</button>
            </section>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")} aria-label="NEXUP — главная">
          <span className="brand-mark">N</span>
          <span className="brand-name">NEXUP<span>24/7</span></span>
        </button>
        <div className="online-indicator"><span className="online-dot" /><span>РАБОТАЕМ 24/7</span></div>
      </header>

      <main className="page-content">
        {tab === "home" && (
          <>
            <section className="hero">
              <div className="hero-glow" />
              <div className="hero-copy">
                <span className="eyebrow"><span className="eyebrow-dot" /> GAME STORE</span>
                <h1>Твоя игра.<br />Твои правила.</h1>
                <p>Пополнение PUBG MOBILE<br />без лишних шагов.</p>
                <button className="button button-primary" onClick={openCatalog}>Открыть каталог <span>↗</span></button>
              </div>
              <div className="hero-mascot" aria-hidden="true">
                <div className="mascot-ring" />
                <div className="mascot-orb">N</div>
                <span className="mascot-spark spark-one">✦</span>
                <span className="mascot-spark spark-two">✧</span>
              </div>
              <div className="hero-index">Nº 001 <span /> NEXUP</div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span className="section-kicker">ВЫБИРАЙ СВОЁ</span><h2>Категории</h2></div></div>
              <div className="category-grid">
                <button className="category-card category-featured" onClick={openCatalog}>
                  <span className="category-symbol uc-symbol">UC</span>
                  <span className="category-text"><strong>Unknown Cash</strong><small>Пополнение UC</small></span>
                  <span className="category-arrow">↗</span>
                </button>
                <button className="category-card" onClick={openCatalog}>
                  <span className="category-symbol pass-symbol">RP</span>
                  <span className="category-text"><strong>Royale Pass</strong><small>Скоро в каталоге</small></span>
                  <span className="category-arrow">↗</span>
                </button>
                <button className="category-card" onClick={openCatalog}>
                  <span className="category-symbol prime-symbol">P</span>
                  <span className="category-text"><strong>Prime</strong><small>Скоро в каталоге</small></span>
                  <span className="category-arrow">↗</span>
                </button>
                <button className="category-card" onClick={openCatalog}>
                  <span className="category-symbol other-symbol">•••</span>
                  <span className="category-text"><strong>Другое</strong><small>Новые товары позже</small></span>
                  <span className="category-arrow">↗</span>
                </button>
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div><span className="section-kicker">БЫСТРО И УДОБНО</span><h2>Популярные UC</h2></div>
                <button className="text-link" onClick={openCatalog}>Все товары <span>→</span></button>
              </div>
              {error && <p className="inline-notice">{error}</p>}
              {renderProducts(products.slice(0, 4))}
            </section>

            <section className="service-note">
              <div className="service-icon">✓</div>
              <div><strong>NEXUP — на связи</strong><p>Поддержка и информация о заказах появятся в следующих обновлениях.</p></div>
            </section>
          </>
        )}

        {tab === "catalog" && (
          <section className="section-block page-section">
            <span className="section-kicker">PUBG MOBILE</span>
            <h1 className="page-title">Выбирай своё</h1>
            <p className="page-description">Пополняй баланс. Выбери подходящий пакет UC.</p>
            {usingFallback && <p className="inline-notice">{error} Цены необходимо сверить с сервером.</p>}
            {renderProducts(products)}
          </section>
        )}

        {tab === "orders" && (
          <section className="empty-page">
            <div className="empty-icon">↻</div>
            <span className="section-kicker">ЛИЧНЫЙ КАБИНЕТ</span>
            <h1 className="page-title">Мои заказы</h1>
            <p>История заказов появится здесь после подключения оформления заказов.</p>
            <button className="button button-primary" onClick={openCatalog}>Перейти в каталог</button>
          </section>
        )}

        {tab === "profile" && (
          <section className="empty-page">
            <div className="profile-avatar">N</div>
            <span className="section-kicker">ТВОЙ NEXUP</span>
            <h1 className="page-title">Профиль</h1>
            <p>Здесь будут отзывы, поддержка и настройки профиля.</p>
            <div className="profile-links">
              <div><span>Отзывы</span><span>↗</span></div>
              <div><span>Поддержка</span><span>↗</span></div>
              <div><span>Документы</span><span>↗</span></div>
            </div>
            <button className="button button-secondary" onClick={openCatalog}>Вернуться в каталог</button>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button className={tab === "home" ? "nav-item active" : "nav-item"} onClick={() => setTab("home")}><span className="nav-icon">⌂</span><span>Главная</span></button>
        <button className={tab === "catalog" ? "nav-item active" : "nav-item"} onClick={openCatalog}><span className="nav-icon">▦</span><span>Каталог</span></button>
        <button className={tab === "orders" ? "nav-item active" : "nav-item"} onClick={() => setTab("orders")}><span className="nav-icon">↻</span><span>Заказы</span></button>
        <button className={tab === "profile" ? "nav-item active" : "nav-item"} onClick={() => setTab("profile")}><span className="nav-icon">◎</span><span>Профиль</span></button>
      </nav>
    </div>
  );
}

export default App;
