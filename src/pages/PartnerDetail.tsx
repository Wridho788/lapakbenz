import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHandshake, FaPhone, FaWhatsapp, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import { AppbarDefault } from '../components/AppbarDefault';
import './PartnerDetail.css';

/* ─── Types ─────────────────────────────────────────────────── */
export interface PartnerFullItem {
  id: number;
  name: string;
  category: string;
  cp: string;
  npwp: string;
  address: string;
  city_name: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  coordinate: string;
  zip: string;
  notes: string;
  image: string | null;
  created: string;
  updated: string | null;
  deleted: string | null;
}

/* ─── Navigation State Shape ─────────────────────────────────── */
interface PartnerDetailLocationState {
  partner: PartnerFullItem;
  imageBaseUrl?: string;
}

/* ─── Helpers ───────────────────────────────────────────────── */
/** Strip whitespace, return '' for '0' / '-' / empty */
const clean = (v?: string): string => {
  if (!v) return '';
  const t = v.trim();
  return t === '0' || t === '-' ? '' : t;
};

/** Convert local phone (08xx) to WhatsApp URL */
const toWhatsAppUrl = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';
  const intl = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
};

/** Normalise to absolute URL */
const toAbsoluteUrl = (url: string): string =>
  url.startsWith('http') ? url : `https://${url}`;

/** Build Google Maps URL from coordinate string or plain address */
const getMapsUrl = (coordinate: string, address: string): string => {
  const valid = coordinate && coordinate !== '0' && coordinate.includes(',');
  if (valid) {
    const [lat, lng] = coordinate.split(',').map((s) => s.trim());
    return `https://maps.google.com/?q=${lat},${lng}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
};

const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

/* ─── Partner Detail ─────────────────────────────────────────── */
const PartnerDetail: React.FC = () => {
 const navigate = useNavigate();
  const location = useLocation();

  // Partner object is passed via navigate(..., { state }) from PartnerPage
  const state = location.state as PartnerDetailLocationState | null;
  const partner = state?.partner;
  const imageBaseUrl = state?.imageBaseUrl ?? '';

  const handleBack = () => navigate(-1);

  /* ── Guard: state missing (user navigated directly to the URL) ── */
  if (!partner) {
    return (
      <div className="partner-detail-page">
        <AppbarDefault
          title="Detail Mitra"
          onBack={handleBack}
          showCart={false}
          showPartner={false}
        />
        <div className="partner-detail-loading">
          <FaHandshake size={44} aria-hidden="true" />
          <p>Data mitra tidak tersedia</p>
          <button className="partner-detail-error-btn" onClick={handleBack}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const getImageSrc = (path?: string | null): string | null => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${imageBaseUrl}${path}`;
  };

  const imageSrc = getImageSrc(partner.image);
  const isLogoImage = imageSrc !== null;

  const phone1 = clean(partner.phone1);
  const phone2 = clean(partner.phone2);
  const whatsAppUrl = phone1 ? toWhatsAppUrl(phone1) : '';
  const mapsUrl = getMapsUrl(partner.coordinate, partner.address);
  const websiteVal = clean(partner.website);
  const emailVal = clean(partner.email);
  const notesVal = clean(partner.notes);
  const cpVal = clean(partner.cp);
  const zipVal = partner.zip !== '0' ? clean(partner.zip) : '';

  return (
    <div className="partner-detail-page">
      <AppbarDefault
        title="Detail Mitra"
        onBack={handleBack}
        showCart={false}
        showPartner={false}
      />

      <div className="partner-detail-content">
        {/* ── Hero ────────────────────────────────────────────── */}
        <div className="partner-detail-hero">
          {isLogoImage ? (
            <img
              src={imageSrc!}
              alt={partner.name}
              className="partner-detail-hero-logo"
              onError={(e) => {
                // On broken image: hide and show the fallback icon sibling
                e.currentTarget.style.display = 'none';
                const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback icon – always rendered but hidden when logo loads OK */}
          <div
            className="partner-detail-hero-icon"
            style={isLogoImage ? { display: 'none' } : {}}
            aria-hidden="true"
          >
            <FaHandshake size={80} />
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="partner-detail-body">
          {/* Category pill */}
          <span className="partner-category-badge">
            {capitalize(partner.category)}
          </span>

          {/* Name */}
          <h2 className="partner-detail-name">{partner.name}</h2>

          {/* Two-column info grid */}
          <div className="partner-detail-info">
            {/* Column 1 – Location */}
            <div className="partner-detail-column">
              {clean(partner.address) && (
                <div className="partner-info-item">
                  <b>📍 Alamat</b>
                  <span className="partner-info-value">{partner.address}</span>
                </div>
              )}
              <div className="partner-info-item">
                <b>🏙️ Kota</b>
                <span className="partner-info-value">{partner.city_name}</span>
              </div>
              {zipVal && (
                <div className="partner-info-item">
                  <b>📮 Kode Pos</b>
                  <span className="partner-info-value">{zipVal}</span>
                </div>
              )}
            </div>

            {/* Column 2 – Contact */}
            <div className="partner-detail-column">
              {cpVal && (
                <div className="partner-info-item">
                  <b>👤 Contact Person</b>
                  <span className="partner-info-value">{capitalize(cpVal)}</span>
                </div>
              )}
              {phone1 && (
                <div className="partner-info-item">
                  <b>📞 Telepon</b>
                  <span className="partner-info-value">
                    {phone1}
                    {phone2 ? ` / ${phone2}` : ''}
                  </span>
                </div>
              )}
              {emailVal && (
                <div className="partner-info-item">
                  <b>✉️ Email</b>
                  <span className="partner-info-value">
                    <a href={`mailto:${emailVal}`}>{emailVal}</a>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {notesVal && (
            <div className="partner-notes-section">
              <div className="partner-notes-label">📋 Layanan &amp; Catatan</div>
              <p className="partner-notes-text">{notesVal}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="partner-actions-section">
            <div className="partner-actions-label">Hubungi &amp; Kunjungi</div>
            <div className="partner-actions">
              {phone1 && (
                <a
                  href={`tel:${phone1}`}
                  className="partner-action-btn partner-action-btn--phone"
                  aria-label={`Telepon ${partner.name}`}
                >
                  <FaPhone size={14} aria-hidden="true" />
                  <span>Telepon</span>
                </a>
              )}

              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-action-btn partner-action-btn--whatsapp"
                  aria-label={`WhatsApp ${partner.name}`}
                >
                  <FaWhatsapp size={15} aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              )}

              {websiteVal && (
                <a
                  href={toAbsoluteUrl(websiteVal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-action-btn partner-action-btn--website"
                  aria-label={`Website ${partner.name}`}
                >
                  <FaGlobe size={14} aria-hidden="true" />
                  <span>Website</span>
                </a>
              )}

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-action-btn partner-action-btn--maps"
                aria-label={`Lokasi ${partner.name} di peta`}
              >
                <FaMapMarkerAlt size={14} aria-hidden="true" />
                <span>Peta</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;