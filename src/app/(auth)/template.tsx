import React from 'react';

interface TemplateProps {
  children: React.ReactNode;
}

/**
 * Renders a template component that centers its children vertically and horizontally on the screen.
 *
 * @param {TemplateProps} props - The props object containing the children to be rendered.
 * @return {JSX.Element} The rendered template component.
 */
const Template: React.FC<TemplateProps> = ({ children }) => {
  return (
    <div
      className="
      h-screen
      p-6 flex 
      justify-center"
    >
      {children}
    </div>
  );
};

export default Template;
