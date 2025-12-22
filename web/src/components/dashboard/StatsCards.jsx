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

import { Avatar, Card, Skeleton, Tag } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 卡片图标颜色配置
const ICON_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const StatsCards = ({
  groupedStatsData,
  loading,
  getTrendSpec,
  CARD_PROPS,
  CHART_CONFIG,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className='mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {groupedStatsData.map((group, idx) => {
          const iconColor = ICON_COLORS[idx % ICON_COLORS.length];
          return (
            <Card
              key={idx}
              {...CARD_PROPS}
              className='!rounded-3xl w-full'
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              title={
                <div className='flex items-center gap-2'>
                  <div 
                    className='w-2 h-2 rounded-full'
                    style={{ background: iconColor }}
                  />
                  <span style={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>
                    {group.title}
                  </span>
                </div>
              }
            >
              <div className='space-y-3'>
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className='flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:bg-gray-50'
                    onClick={item.onClick}
                  >
                    <div className='flex items-center'>
                      <Avatar
                        className='mr-3'
                        size='small'
                        style={{ 
                          background: `${iconColor}15`,
                          color: iconColor
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <div>
                        <div className='text-xs text-gray-500'>
                          {item.title}
                        </div>
                        <div className='text-lg font-semibold text-gray-800'>
                          <Skeleton
                            loading={loading}
                            active
                            placeholder={
                              <Skeleton.Paragraph
                                active
                                rows={1}
                                style={{
                                  width: '65px',
                                  height: '24px',
                                  marginTop: '4px',
                                }}
                              />
                            }
                          >
                            {item.value}
                          </Skeleton>
                        </div>
                      </div>
                    </div>
                    {item.title === t('当前余额') ? (
                      <Tag
                        color='green'
                        shape='circle'
                        size='large'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/console/topup');
                        }}
                      >
                        {t('充值')}
                      </Tag>
                    ) : (
                      (loading ||
                        (item.trendData && item.trendData.length > 0)) && (
                        <div className='w-24 h-10'>
                          <VChart
                            spec={getTrendSpec(item.trendData, iconColor)}
                            option={CHART_CONFIG}
                          />
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;
