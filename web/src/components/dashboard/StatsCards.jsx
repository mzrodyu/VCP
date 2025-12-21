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
    <div className='dashboard-stats-section'>
      <div className='dashboard-stats-grid'>
        {groupedStatsData.map((group, idx) => (
          <Card
            key={idx}
            {...CARD_PROPS}
            className={`dashboard-stat-card ${group.color} animate-fade-in-up`}
            style={{ animationDelay: `${idx * 0.1}s` }}
            title={<span className="stat-card-title">{group.title}</span>}
          >
            <div className='stat-card-content'>
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className='stat-item'
                  onClick={item.onClick}
                >
                  <div className='stat-item-left'>
                    <div className='stat-icon-wrapper'>
                      {item.icon}
                    </div>
                    <div className='stat-info'>
                      <div className='stat-label'>{item.title}</div>
                      <div className='stat-value'>
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
                  <div className='stat-item-right'>
                    {item.title === t('当前余额') ? (
                      <Tag
                        className='topup-tag'
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
                      item.trendData && item.trendData.length > 0 && (
                        <div className='stat-chart'>
                          <VChart
                            spec={getTrendSpec(item.trendData, item.trendColor)}
                            option={CHART_CONFIG}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
