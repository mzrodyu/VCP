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

import { Card, Skeleton, Tag } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 绿色主题卡片背景配置
const CARD_BACKGROUNDS = [
  { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', text: 'white' },
  { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: 'white' },
  { bg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', text: 'white' },
  { bg: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)', text: '#065f46' },
];

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
          const cardStyle = CARD_BACKGROUNDS[idx % CARD_BACKGROUNDS.length];
          return (
            <Card
              key={idx}
              {...CARD_PROPS}
              className='border-0 !rounded-2xl w-full'
              style={{
                background: cardStyle.bg,
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)'
              }}
              title={
                <span style={{ color: cardStyle.text, fontWeight: 600 }}>
                  {group.title}
                </span>
              }
            >
              <div className='space-y-4'>
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className='flex items-center justify-between cursor-pointer p-2 rounded-xl transition-all hover:bg-white/10'
                    onClick={item.onClick}
                  >
                    <div className='flex items-center'>
                      <div 
                        className='w-10 h-10 rounded-xl flex items-center justify-center mr-3'
                        style={{ background: 'rgba(255,255,255,0.25)' }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: cardStyle.text }}>
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
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          color: '#059669',
                          border: 'none',
                          fontWeight: 600
                        }}
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
                            spec={getTrendSpec(item.trendData, 'rgba(255,255,255,0.8)')}
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
