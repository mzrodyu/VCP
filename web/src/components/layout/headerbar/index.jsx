/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import { useHeaderBar } from '../../../hooks/common/useHeaderBar';
import { useNavigation } from '../../../hooks/common/useNavigation';
import { useNotifications } from '../../../hooks/common/useNotifications';
import NoticeModal from '../NoticeModal';
import ActionButtons from './ActionButtons';
import HeaderLogo from './HeaderLogo';
import MobileMenuButton from './MobileMenuButton';
import Navigation from './Navigation';

const HeaderBar = ({ onMobileMenuToggle, drawerOpen }) => {
  const {
    userState,
    statusState,
    isMobile,
    collapsed,
    logoLoaded,
    currentLang,
    isLoading,
    systemName,
    logo,
    isNewYear,
    isSelfUseMode,
    docsLink,
    isDemoSiteMode,
    isConsoleRoute,
    theme,
    headerNavModules,
    pricingRequireAuth,
    logout,
    handleLanguageChange,
    handleThemeToggle,
    handleMobileMenuToggle,
    navigate,
    t,
  } = useHeaderBar({ onMobileMenuToggle, drawerOpen });

  const {
    noticeVisible,
    unreadCount,
    handleNoticeOpen,
    handleNoticeClose,
    getUnreadKeys,
  } = useNotifications(statusState);

  const { mainNavLinks } = useNavigation(t, docsLink, headerNavModules);

  return (
    <header 
      className='sticky top-0 z-50 h-16 flex items-center px-4'
      style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 4px 30px rgba(139, 92, 246, 0.15)',
      }}
    >
      <NoticeModal
        visible={noticeVisible}
        onClose={handleNoticeClose}
        isMobile={isMobile}
        defaultTab={unreadCount > 0 ? 'system' : 'inApp'}
        unreadKeys={getUnreadKeys()}
      />

      <div className='w-full flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <MobileMenuButton
            isConsoleRoute={isConsoleRoute}
            isMobile={isMobile}
            drawerOpen={drawerOpen}
            collapsed={collapsed}
            onToggle={handleMobileMenuToggle}
            t={t}
          />

          <HeaderLogo
            isMobile={isMobile}
            isConsoleRoute={isConsoleRoute}
            logo={logo}
            logoLoaded={logoLoaded}
            isLoading={isLoading}
            systemName={systemName}
            isSelfUseMode={isSelfUseMode}
            isDemoSiteMode={isDemoSiteMode}
            t={t}
          />
        </div>

        <Navigation
          mainNavLinks={mainNavLinks}
          isMobile={isMobile}
          isLoading={isLoading}
          userState={userState}
          pricingRequireAuth={pricingRequireAuth}
        />

        <div className='flex items-center gap-2'>
          <ActionButtons
            isNewYear={isNewYear}
            unreadCount={unreadCount}
            onNoticeOpen={handleNoticeOpen}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
            userState={userState}
            isLoading={isLoading}
            isMobile={isMobile}
            isSelfUseMode={isSelfUseMode}
            logout={logout}
            navigate={navigate}
            t={t}
          />
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
