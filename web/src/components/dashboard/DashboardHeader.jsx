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

import { Calendar, RefreshCw, Search, User } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className='mb-8'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        {/* 左侧欢迎语 */}
        <div>
          <div className='flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-1 font-medium'>
            <Calendar className='w-4 h-4' />
            <span>{dateStr}</span>
          </div>
          <h1
            className='text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight transition-all duration-700'
            style={{ 
              opacity: greetingVisible ? 1 : 0,
              transform: greetingVisible ? 'translateY(0)' : 'translateY(10px)'
            }}
          >
            {getGreeting}
          </h1>
          <p className='text-zinc-500 dark:text-zinc-400 mt-1 text-base'>
            {t('这是您的今日数据概览')}
          </p>
        </div>

        {/* 右侧操作按钮 */}
        <div className='flex items-center gap-3'>
          <div className='hidden md:flex items-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-500 dark:text-zinc-400'>
            <User className='w-4 h-4 mr-2' />
            <span>{t('标准用户')}</span>
          </div>
          
          <div className='h-8 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block mx-1'></div>

          <button
            onClick={showSearchModal}
            className='flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-200 transition-all shadow-sm hover:shadow'
          >
            <Search className='w-4 h-4 md:mr-2' />
            <span className='hidden md:inline font-medium text-sm'>{t('搜索')}</span>
          </button>
          
          <button
            onClick={refresh}
            disabled={loading}
            className='flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-70'
          >
            <RefreshCw className={`w-4 h-4 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className='hidden md:inline font-medium text-sm'>{t('刷新')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
