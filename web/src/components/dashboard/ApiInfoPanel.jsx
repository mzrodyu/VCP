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

import {
    IllustrationConstruction,
    IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import { Empty } from '@douyinfe/semi-ui';
import { Copy, ExternalLink, Gauge, Globe, Server } from 'lucide-react';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const ApiInfoPanel = ({
  apiInfoData,
  handleCopyUrl,
  handleSpeedTest,
  CARD_PROPS,
  FLEX_CENTER_GAP2,
  ILLUSTRATION_SIZE,
  t,
}) => {
  return (
    <div className='bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg h-full'>
      {/* 标题栏 */}
      <div className='px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-emerald-500 to-teal-600'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center'>
            <Server className='w-5 h-5 text-white' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-white'>
              {t('API信息')}
            </h3>
            <p className='text-sm text-white/70'>
              {t('可用的API端点')}
            </p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <ScrollableContainer maxHeight='20rem'>
        <div className='p-4'>
          {apiInfoData.length > 0 ? (
            <div className='space-y-3'>
              {apiInfoData.map((api) => (
                <div
                  key={api.id}
                  className='group p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 rounded-2xl transition-all duration-200 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800'
                >
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0'>
                      <Globe className='w-5 h-5 text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2 mb-2'>
                        <span className='text-sm font-bold text-slate-800 dark:text-white truncate'>
                          {api.route}
                        </span>
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => handleSpeedTest(api.url)}
                            className='p-2 rounded-lg bg-white dark:bg-slate-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 transition-colors'
                            title={t('测速')}
                          >
                            <Gauge className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleCopyUrl(api.url)}
                            className='p-2 rounded-lg bg-white dark:bg-slate-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 transition-colors'
                            title={t('复制')}
                          >
                            <Copy className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => window.open(api.url, '_blank', 'noopener,noreferrer')}
                            className='p-2 rounded-lg bg-white dark:bg-slate-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 transition-colors'
                            title={t('跳转')}
                          >
                            <ExternalLink className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                      <div
                        className='text-sm text-emerald-600 dark:text-emerald-400 break-all cursor-pointer hover:underline mb-1 font-mono'
                        onClick={() => handleCopyUrl(api.url)}
                      >
                        {api.url}
                      </div>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>
                        {api.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex justify-center items-center min-h-[16rem] w-full'>
              <Empty
                image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
                darkModeImage={<IllustrationConstructionDark style={ILLUSTRATION_SIZE} />}
                title={t('暂无API信息')}
                description={t('请联系管理员在系统设置中配置API信息')}
              />
            </div>
          )}
        </div>
      </ScrollableContainer>
    </div>
  );
};

export default ApiInfoPanel;
