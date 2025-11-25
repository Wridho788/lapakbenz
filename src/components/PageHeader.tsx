import React from 'react';
import './SEOComponents.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: Array<{
    name: string;
    url?: string;
  }>;
  image?: string;
  tags?: string[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs = [],
  image,
  tags = []
}) => {
  return (
    <header className="page-header" role="banner">
      {/* Breadcrumbs Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="breadcrumb-nav">
          <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
            {breadcrumbs.map((crumb, index) => (
              <li 
                key={index}
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'current' : ''}`}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {crumb.url ? (
                  <a 
                    href={crumb.url}
                    itemProp="item"
                    aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    <span itemProp="name">{crumb.name}</span>
                  </a>
                ) : (
                  <span itemProp="name">{crumb.name}</span>
                )}
                <meta itemProp="position" content={(index + 1).toString()} />
                {index < breadcrumbs.length - 1 && <span className="separator" aria-hidden="true"> › </span>}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main Header Content */}
      <div className="header-content">
        {image && (
          <div className="header-image">
            <img 
              src={image} 
              alt={title}
              loading="lazy"
              itemProp="image"
            />
          </div>
        )}
        
        <div className="header-text">
          <h1 className="page-title" itemProp="headline">{title}</h1>
          {subtitle && (
            <h2 className="page-subtitle" itemProp="alternativeHeadline">{subtitle}</h2>
          )}
          {description && (
            <p className="page-description" itemProp="description">{description}</p>
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="page-tags" itemProp="keywords">
              <span className="tags-label">Tags: </span>
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}{index < tags.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;