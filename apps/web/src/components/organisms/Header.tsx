import React from 'react';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarDivider,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Settings24Regular,
  Person24Regular,
} from '@fluentui/react-icons';

export interface HeaderProps {
  title?: string;
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Aplikasi',
  onHomeClick,
  onSettingsClick,
  onProfileClick,
}) => {
  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      padding: '12px 24px',
      borderBottom: '1px solid #e0e0e0',
    }}>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton icon={<Home24Regular />} onClick={onHomeClick}>
            {title}
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton
            icon={<Settings24Regular />}
            onClick={onSettingsClick}
            aria-label="Pengaturan"
          />
          <ToolbarButton
            icon={<Person24Regular />}
            onClick={onProfileClick}
            aria-label="Profil"
          />
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
};

export default Header;
