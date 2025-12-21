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

import { IconChevronDown, IconChevronUp } from '@douyinfe/semi-icons';
import { Button, Card, Typography } from '@douyinfe/semi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIsMobile } from '../../../hooks/common/useIsMobile';

const { Text } = Typography;

/**
 * CardPro 高级卡片组件 - 全新设计
 *
 * 布局分为6个区域：
 * 1. 统计信息区域 (statsArea)
 * 2. 描述信息区域 (descriptionArea)
 * 3. 类型切换/标签区域 (tabsArea)
 * 4. 操作按钮区域 (actionsArea)
 * 5. 搜索表单区域 (searchArea)
 * 6. 分页区域 (paginationArea) - 固定在卡片底部
 *
 * 支持三种布局类型：
 * - type1: 操作型 (如TokensTable) - 描述信息 + 操作按钮 + 搜索表单
 * - type2: 查询型 (如LogsTable) - 统计信息 + 搜索表单
 * - type3: 复杂型 (如ChannelsTable) - 描述信息 + 类型切换 + 操作按钮 + 搜索表单
 */
const CardPro = ({
  type = 'type1',
  className = '',
  children,
  // 各个区域的内容
  statsArea,
  descriptionArea,
  tabsArea,
  actionsArea,
  searchArea,
  paginationArea,
  // 卡片属性
  shadows = '',
  bordered = true,
  // 自定义样式
  style,
  // 国际化函数
  t = (key) => key,
  ...props
}) => {
  const isMobile = useIsMobile();
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const toggleMobileActions = () => {
    setShowMobileActions(!showMobileActions);
  };

  const hasMobileHideableContent = actionsArea || searchArea;

  const renderHeader = () => {
    const hasContent =
      statsArea || descriptionArea || tabsArea || actionsArea || searchArea;
    if (!hasContent) return null;

    return (
      <div className='cardpro-header'>
        {/* 顶部区域：标题/描述 + 操作按钮 */}
        <div className='cardpro-header-top'>
          {/* 左侧：描述信息或统计信息 */}
          <div className='cardpro-header-left'>
            {type === 'type2' && statsArea && (
              <div className='cardpro-stats'>{statsArea}</div>
            )}
            {(type === 'type1' || type === 'type3') && descriptionArea && (
              <div className='cardpro-description'>{descriptionArea}</div>
            )}
          </div>

          {/* 右侧：操作按钮区域 - 桌面端显示 */}
          {!isMobile && (type === 'type1' || type === 'type3') && actionsArea && (
            <div className='cardpro-header-right'>
              <div className='cardpro-actions'>
                {Array.isArray(actionsArea) ? (
                  actionsArea.map((area, idx) => (
                    <React.Fragment key={idx}>{area}</React.Fragment>
                  ))
                ) : (
                  actionsArea
                )}
              </div>
            </div>
          )}
        </div>

        {/* 类型切换/标签区域 - 主要用于type3 */}
        {type === 'type3' && tabsArea && (
          <div className='cardpro-tabs'>{tabsArea}</div>
        )}

        {/* 移动端操作切换按钮 */}
        {isMobile && hasMobileHideableContent && (
          <div className='cardpro-mobile-toggle'>
            <Button
              onClick={toggleMobileActions}
              icon={showMobileActions ? <IconChevronUp /> : <IconChevronDown />}
              type='tertiary'
              size='small'
              theme='borderless'
              className='cardpro-toggle-btn'
            >
              {showMobileActions ? t('收起操作') : t('展开操作')}
            </Button>
          </div>
        )}

        {/* 移动端操作区域 */}
        {isMobile && showMobileActions && (type === 'type1' || type === 'type3') && actionsArea && (
          <div className='cardpro-mobile-actions'>
            {Array.isArray(actionsArea) ? (
              actionsArea.map((area, idx) => (
                <React.Fragment key={idx}>{area}</React.Fragment>
              ))
            ) : (
              actionsArea
            )}
          </div>
        )}

        {/* 搜索/筛选区域 */}
        {searchArea && (
          <div className='cardpro-filters'>
            <div className='cardpro-filters-header'>
              <button
                className='cardpro-filters-toggle'
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <span className='cardpro-filters-title'>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  {t('筛选条件')}
                </span>
                <span className={`cardpro-filters-arrow ${filtersExpanded ? 'expanded' : ''}`}>
                  <IconChevronDown />
                </span>
              </button>
            </div>
            <div className={`cardpro-filters-content ${filtersExpanded ? 'expanded' : ''}`}>
              {searchArea}
            </div>
          </div>
        )}
      </div>
    );
  };

  const headerContent = renderHeader();

  // 渲染分页区域
  const renderFooter = () => {
    if (!paginationArea) return null;

    return (
      <div className='cardpro-footer'>
        <div className='cardpro-pagination'>
          {paginationArea}
        </div>
      </div>
    );
  };

  const footerContent = renderFooter();

  return (
    <Card
      className={`cardpro-container ${className}`}
      title={headerContent}
      footer={footerContent}
      shadows={shadows}
      bordered={bordered}
      style={style}
      {...props}
    >
      <div className='cardpro-body'>
        {children}
      </div>
    </Card>
  );
};

CardPro.propTypes = {
  // 布局类型
  type: PropTypes.oneOf(['type1', 'type2', 'type3']),
  // 样式相关
  className: PropTypes.string,
  style: PropTypes.object,
  shadows: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  bordered: PropTypes.bool,
  // 内容区域
  statsArea: PropTypes.node,
  descriptionArea: PropTypes.node,
  tabsArea: PropTypes.node,
  actionsArea: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  searchArea: PropTypes.node,
  paginationArea: PropTypes.node,
  // 表格内容
  children: PropTypes.node,
  // 国际化函数
  t: PropTypes.func,
};

export default CardPro;
