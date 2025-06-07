import React from 'react';
import theme from '../../design/theme';

/**
 * FormSection component - A container for grouping related form fields
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {string} props.description - Section description
 * @param {React.ReactNode} props.children - Section content (form fields)
 * @param {boolean} props.collapsible - Whether section is collapsible
 * @param {boolean} props.defaultExpanded - Whether section is expanded by default
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showDivider - Whether to show divider at bottom
 */
const FormSection = ({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  className = '',
  showDivider = true,
}) => {
  // State for collapsible sections
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Toggle section expansion
  const toggleExpand = () => {
    if (collapsible) {
      setIsExpanded(prev => !prev);
    }
  };

  // Container styles
  const containerStyles = {
    marginBottom: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border.light}`,
  };

  // Title styles
  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: description ? theme.spacing[1] : theme.spacing[3],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: collapsible ? 'pointer' : 'default',
  };

  // Description styles
  const descriptionStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  };

  // Divider styles
  const dividerStyles = {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    height: '1px',
    backgroundColor: theme.colors.border.light,
  };

  // Content styles
  const contentStyles = {
    display: isExpanded ? 'block' : 'none',
  };

  return (
    <div style={containerStyles} className={className}>
      {title && (
        <div style={titleStyles} onClick={toggleExpand}>
          <h3>{title}</h3>
          {collapsible && (
            <button 
              type="button"
              aria-expanded={isExpanded}
              aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          )}
        </div>
      )}
      
      {description && <p style={descriptionStyles}>{description}</p>}
      
      <div 
        id={title ? `section-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
        style={contentStyles}
      >
        {children}
      </div>
      
      {showDivider && <div style={dividerStyles}></div>}
    </div>
  );
};

export default FormSection;
