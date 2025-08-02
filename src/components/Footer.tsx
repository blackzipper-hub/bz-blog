import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <div className="container">
        <FooterContent>
          <p>&copy; 2024 个人博客. 基于 React + Node.js 构建</p>
        </FooterContent>
      </div>
    </FooterContainer>
  );
};

export default Footer; 