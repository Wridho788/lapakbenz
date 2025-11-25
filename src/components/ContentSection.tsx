import React from 'react';
import './SEOComponents.css';

interface ContentSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  sectionType?: 'main' | 'aside' | 'article' | 'section';
  id?: string;
  itemScope?: boolean;
  itemType?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  subtitle,
  description,
  children,
  className = '',
  sectionType = 'section',
  id,
  itemScope = false,
  itemType
}) => {
  const props: any = {
    className: `content-section ${className}`.trim(),
    id
  };

  if (itemScope) {
    props.itemScope = true;
    if (itemType) {
      props.itemType = itemType;
    }
  }

  const renderContent = () => (
    <>
      {(title || subtitle || description) && (
        <header className="section-header">
          {title && (
            <h2 className="section-title" itemProp="headline">{title}</h2>
          )}
          {subtitle && (
            <h3 className="section-subtitle" itemProp="alternativeHeadline">{subtitle}</h3>
          )}
          {description && (
            <p className="section-description" itemProp="description">{description}</p>
          )}
        </header>
      )}
      
      <div className="section-content">
        {children}
      </div>
    </>
  );

  switch (sectionType) {
    case 'main':
      return <main {...props}>{renderContent()}</main>;
    case 'aside':
      return <aside {...props}>{renderContent()}</aside>;
    case 'article':
      return <article {...props}>{renderContent()}</article>;
    default:
      return <section {...props}>{renderContent()}</section>;
  }
};

export default ContentSection;