import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
import './Product.css';

interface ProductItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

const Product: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { cartCount } = useCart();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked - Navigate to cart page');
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const products: ProductItem[] = [
    {
      id: '1',
      title: 'Merciku T-Shirt Premium',
      price: 149000,
      image: '/bea2x.jpg',
      category: 'Apparel',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Merciku Hoodie Limited Edition',
      price: 299000,
      image: '/bea2x.jpg',
      category: 'Apparel',
      rating: 4.9
    },
    {
      id: '3',
      title: 'Merciku Notebook Set',
      price: 75000,
      image: '/bea2x.jpg',
      category: 'Stationery',
      rating: 4.6
    },
    {
      id: '4',
      title: 'Merciku Coffee Mug',
      price: 89000,
      image: '/bea2x.jpg',
      category: 'Accessories',
      rating: 4.7
    },
    {
      id: '5',
      title: 'Merciku Laptop Sticker Pack',
      price: 35000,
      image: '/bea2x.jpg',
      category: 'Accessories',
      rating: 4.5
    },
    {
      id: '6',
      title: 'Merciku Tote Bag Canvas',
      price: 125000,
      image: '/bea2x.jpg',
      category: 'Accessories',
      rating: 4.8
    }
  ];

  const categories = ['All', 'Apparel', 'Accessories', 'Stationery'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="product-page">
      <AppbarDefault
        title="Product Catalog"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div className="product-content">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-bar">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <MdFilterList className="filter-icon" />
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <div className="product-catalog">
          <h3 className="catalog-title">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            <span className="product-count">({filteredProducts.length} items)</span>
          </h3>
          
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image">
                  <img
                    src={product.image}
                    alt={product.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/bea2x.jpg";
                    }}
                  />
                </div>
                <div className="product-info">
                  <h4 className="product-title">{product.title}</h4>
                  <div className="product-rating">
                    <span className="rating-stars">⭐ {product.rating}</span>
                    <span className="product-category">{product.category}</span>
                  </div>
                  <div className="product-price">
                    Rp {product.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Products" className="empty-icon" />
              <h3>No Products Found</h3>
              <p>Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Product;
