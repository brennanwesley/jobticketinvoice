import React from 'react';
import theme from '../../design/theme';

/**
 * FormGroup component - A container for grouping related form fields
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Group title
 * @param {string} props.description - Group description
 * @param {React.ReactNode} props.children - Group content (form fields)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.layout - Layout of fields within group (default, grid, inline)
 * @param {number} props.columns - Number of columns for grid layout
 * @param {string} props.gap - Gap between grid items
 */
const FormGroup = ({
  title,
  description,
  children,
  className = '',
  layout = 'default',
  columns = 2,
  gap = '1rem',
}) => {
  // Container styles
  const containerStyles = {
    marginBottom: theme.spacing[4],
  };

  // Title styles
  const titleStyles = {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: description ? theme.spacing[1] : theme.spacing[2],
  };

  // Description styles
  const descriptionStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  };

  // Content styles based on layout
  const getContentStyles = () => {
    switch (layout) {
      case 'grid':
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        };
      case 'inline':
        return {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap,
        };
      case 'default':
      default:
        return {};
    }
  };

  return (
    <div style={containerStyles} className={className}>
      {title && <h4 style={titleStyles}>{title}</h4>}
      {description && <p style={descriptionStyles}>{description}</p>}
      <div style={getContentStyles()}>
        {children}
      </div>
    </div>
  );
};

export default FormGroup;
