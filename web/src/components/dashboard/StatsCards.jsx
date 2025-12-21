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

  return (
    <div className='mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        {groupedStatsData.map((group, idx) => (
          <div
            key={idx}
            className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 group'
          >
            {/* 标题栏 */}
            <div className='flex items-center justify-between mb-6'>
              <span className='text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider'>
                {group.title}
              </span>
              {idx === 0 && (
                 <div className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
              )}
            </div>

            {/* 统计内容 */}
            <div className='space-y-6'>
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className='flex flex-col gap-2 cursor-pointer'
                  onClick={item.onClick}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className={`p-2 rounded-lg ${
                        idx === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                        idx === 1 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        idx === 2 ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' :
                        'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {item.icon}
                      </div>
                      <span className='text-zinc-600 dark:text-zinc-400 text-sm font-medium'>
                        {item.title}
                      </span>
                    </div>
                    
                    {item.title === t('当前余额') && (
                       <button
                        className='px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/console/topup');
                        }}
                      >
                        <Zap size={12} fill="currentColor" />
                        {t('充值')}
                      </button>
                    )}
                  </div>

                  <div className='flex items-baseline justify-between pl-11'>
                    <div className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight'>
                      <Skeleton
                        loading={loading}
                        active
                        placeholder={
                          <div className='h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse' />
                        }
                      >
                         {item.value}
                      </Skeleton>
                    </div>

                    {/* 趋势图或简单指标 */}
                    {item.trendData && item.trendData.length > 0 ? (
                      <div className='w-20 h-8 opacity-50 grayscale group-hover:grayscale-0 transition-all'>
                         <VChart
                          spec={getTrendSpec(item.trendData, '#10b981')} // 使用统一的绿色或根据状态变化
                          option={{ ...CHART_CONFIG, animation: false }} // 禁用动画以提高性能
                        />
                      </div>
                    ) : (
                      // 如果没有趋势图，显示一个装饰性的箭头或图标
                      <ArrowUpRight className='w-4 h-4 text-zinc-300 dark:text-zinc-700' />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
