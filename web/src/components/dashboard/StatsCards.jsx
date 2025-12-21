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

import { Skeleton } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { ArrowUpRight, Zap } from 'lucide-react';
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

  // 渐变背景色配置
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ];

  return (
    <div className='mb-6'>
      {/* 主要统计卡片 - 大尺寸横向布局 */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5'>
        {groupedStatsData.map((group, idx) => (
          <div
            key={idx}
            className='relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer group'
            style={{
              background: gradients[idx % gradients.length],
              animationDelay: `${idx * 0.1}s`,
            }}
          >
            {/* 装饰性背景图案 */}
            <div className='absolute top-0 right-0 w-32 h-32 opacity-20'>
              <svg viewBox="0 0 200 200" className='w-full h-full'>
                <circle cx="100" cy="100" r="80" fill="white" />
              </svg>
            </div>
            <div className='absolute -bottom-4 -right-4 w-24 h-24 opacity-10'>
              <svg viewBox="0 0 200 200" className='w-full h-full'>
                <circle cx="100" cy="100" r="100" fill="white" />
              </svg>
            </div>

            {/* 卡片标题 */}
            <div className='flex items-center justify-between mb-4 relative z-10'>
              <span className='text-white/80 text-sm font-medium uppercase tracking-wider'>
                {group.title}
              </span>
              <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm'>
                <ArrowUpRight className='w-4 h-4 text-white' />
              </div>
            </div>

            {/* 统计项目 */}
            <div className='space-y-4 relative z-10'>
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className='flex items-center justify-between'
                  onClick={item.onClick}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white'>
                      {item.icon}
                    </div>
                    <div>
                      <div className='text-white/70 text-xs font-medium'>{item.title}</div>
                      <div className='text-white text-xl font-bold'>
                        <Skeleton
                          loading={loading}
                          active
                          placeholder={
                            <Skeleton.Paragraph
                              active
                              rows={1}
                              style={{ width: '60px', height: '20px' }}
                            />
                          }
                        >
                          {item.value}
                        </Skeleton>
                      </div>
                    </div>
                  </div>

                  {/* 充值按钮或趋势图 */}
                  {item.title === t('当前余额') ? (
                    <button
                      className='px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-semibold flex items-center gap-1 transition-all'
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/console/topup');
                      }}
                    >
                      <Zap className='w-3 h-3' />
                      {t('充值')}
                    </button>
                  ) : (
                    item.trendData && item.trendData.length > 0 && (
                      <div className='w-20 h-8 opacity-80'>
                        <VChart
                          spec={getTrendSpec(item.trendData, '#ffffff')}
                          option={CHART_CONFIG}
                        />
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>

            {/* 悬浮光效 */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
