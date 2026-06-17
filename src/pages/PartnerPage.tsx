import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandshake } from 'react-icons/fa';
import { MdLocationOn, MdBusiness } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { usePartnerCategories, usePartnerCities, usePartnerList } from '../api/hooks/partnerHooks';
import type { PartnerItem } from '../api/partnerApi';
import './PartnerPage.css';

const PARTNER_LIST_LIMIT = '20';

/* ─── Skeleton Card ─────────────────────────────────────────── */
const SkeletonCard: React.FC = () => (
  <div className="partner-card partner-card--skeleton" aria-hidden="true">
    <div className="card-icon skeleton-box" />
    <div className="card-body">
      <div className="skeleton-line skeleton-line--wide" />
      <div className="skeleton-line skeleton-line--medium" />
      <div className="card-pills">
        <div className="skeleton-pill" />
        <div className="skeleton-pill" />
      </div>
    </div>
  </div>
);

/* ─── Partner Card ──────────────────────────────────────────── */
interface PartnerCardProps {
  partner: PartnerItem;
  onClick: () => void;
}

const capitalizeName = (name: string) => {
  if (!name) return 'User';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const PartnerCard: React.FC<PartnerCardProps> = React.memo(({ partner, onClick }) => (
  <div
    className="partner-card"
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    style={{ cursor: 'pointer' }}
  >
    <div className="card-icon">
      <FaHandshake size={22} aria-hidden="true" />
    </div>
    <div className="card-body">
      <div className="partner-name">{capitalizeName(partner.name)}</div>
      <div className="partner-address">
        <MdLocationOn size={13} aria-hidden="true" />
        <span>{partner.address}</span>
      </div>
      <div className="card-pills">
        <span className="pill pill--category">{capitalizeName(partner.category)}</span>
        <br />
        <span className="pill pill--city">{partner.city_name}</span>
      </div>
    </div>
  </div>
));
PartnerCard.displayName = 'PartnerCard';

/* ─── Page ──────────────────────────────────────────────────── */
const PartnerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const { data: categoriesData, isLoading: categoriesLoading } = usePartnerCategories();
  const { data: citiesData, isLoading: citiesLoading } = usePartnerCities();

  const listPayload = useMemo(
    () => ({
      category: selectedCategory,
      city: selectedCity,
      limit: PARTNER_LIST_LIMIT,
      offset: '0',
    }),
    [selectedCategory, selectedCity],
  );

  const {
    data: partnerData,
    isLoading: partnersLoading,
    isError: partnersErrored,
    error: partnersError,
  } = usePartnerList(listPayload);

  const categories = categoriesData?.result ?? [];
  const cities = citiesData?.result ?? [];
  const partners = partnerData?.result ?? [];
  const filtersDisabled = categoriesLoading || citiesLoading;
  const hasActiveFilter = selectedCategory !== '' || selectedCity !== '';

  // Base URL for partner images, forwarded to the detail page via navigation state
  const imageBaseUrl = useMemo(
    () => ((partnerData as unknown as Record<string, unknown>)?.image_url as string) ?? '',
    [partnerData],
  );
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
  };
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value),
    [],
  );
  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value),
    [],
  );

  // Pass the full partner object + imageBaseUrl via navigation state – no ID in the URL
  const handlePartnerClick = useCallback(
    (partner: PartnerItem) => navigate('/partner/detail', { state: { partner, imageBaseUrl } }),
    [navigate, imageBaseUrl],
  );
  return (
    <div className="partner-page">
      <AppbarDefault
        title="Partners"
        showCart={true}
        showPartner={false}
        onBack={() => navigate(-1)}
      />

      <div className="partner-content">
        {/* ── Filters ── */}
        <div className="filter-bar">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={filtersDisabled}
            className={`filter-chip${selectedCategory ? ' filter-chip--active' : ''}`}
            aria-label="Filter kategori"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={handleCityChange}
            disabled={filtersDisabled}
            className={`filter-chip${selectedCity ? ' filter-chip--active' : ''}`}
            aria-label="Filter kota"
          >
            <option value="">Semua Kota</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              className="filter-clear"
              onClick={handleClearFilters}
              aria-label="Reset filter"
              title="Reset filter"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Result count ── */}
        {!partnersLoading && !partnersErrored && partners.length > 0 && (
          <p className="result-info">{partners.length} mitra ditemukan</p>
        )}

        {/* ── List ── */}
        <div className="partner-list">
          {partnersLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : partnersErrored ? (
            <div className="state-empty state-empty--error">
              <MdBusiness size={44} aria-hidden="true" />
              <p>{partnersError?.message ?? 'Gagal memuat data mitra.'}</p>
              <button className="action-btn" onClick={() => window.location.reload()}>
                Coba Lagi
              </button>
            </div>
          ) : partners.length === 0 ? (
            <div className="state-empty">
              <FaHandshake size={44} aria-hidden="true" />
              <p>Belum ada mitra yang ditemukan</p>
              {hasActiveFilter && (
                <button className="action-btn" onClick={handleClearFilters}>
                  Hapus Filter
                </button>
              )}
            </div>
          ) : (
            partners.map((p) => (
              <PartnerCard key={p.id} partner={p} onClick={() => handlePartnerClick(p)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerPage;
