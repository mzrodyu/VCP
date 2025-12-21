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

import { VChart } from '@visactor/react-vchart';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

const ChartsPanel = ({
  activeChartTab,
  setActiveChartTab,
  spec_line,
  spec_model_line,
  spec_pie,
  spec_rank_bar,
  CARD_PROPS,
  CHART_CONFIG,
  FLEX_CENTER_GAP2,
  hasApiInfoPanel,
  t,
}) => {
  const tabs = [
    { key: '1', label: t('消耗分布'), icon: TrendingUp },
    { key: '2', label: t('消耗趋势'), icon: Activity },
    { key: '3', label: t('调用分布'), icon: PieChartIcon },
    { key: '4', label: t('调用排行'), icon: BarChart3 },
  ];

  return (
    <div className={`${hasApiInfoPanel ? 'lg:col-span-3' : ''}`}>
      <div className='bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg'>
        {/* 标题栏 */}
        <div className='px-6 py-5 border-b border-slate-100 dark:border-slate-700'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center'>
                <BarChart3 className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800 dark:text-white'>
                  {t('模型数据分析')}
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  {t('实时监控您的API使用情况')}
                </p>
              </div>
            </div>

            {/* 现代化标签切换 */}
            <div className='flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl'>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeChartTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveChartTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span className='hidden md:inline'>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className='h-96 p-4 bg-slate-50/50 dark:bg-slate-800/50'>
          <div className='h-full bg-white dark:bg-slate-800 rounded-2xl p-2'>
            {activeChartTab === '1' && (
              <VChart spec={spec_line} option={CHART_CONFIG} />
            )}
            {activeChartTab === '2' && (
              <VChart spec={spec_model_line} option={CHART_CONFIG} />
            )}
            {activeChartTab === '3' && (
              <VChart spec={spec_pie} option={CHART_CONFIG} />
            )}
            {activeChartTab === '4' && (
              <VChart spec={spec_rank_bar} option={CHART_CONFIG} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPanel;
