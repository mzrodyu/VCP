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

import { Button } from '@douyinfe/semi-ui';
import { LayoutDashboard, RefreshCw, Search } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  return (
    <div 
      className='mb-6 p-6 rounded-2xl'
      style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        boxShadow: '0 4px 20px rgba(5, 150, 105, 0.3)'
      }}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div 
            className='w-12 h-12 rounded-xl flex items-center justify-center'
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <LayoutDashboard size={24} color="white" />
          </div>
          <div>
            <h2
              className='text-2xl font-bold text-white transition-opacity duration-1000 ease-in-out'
              style={{ opacity: greetingVisible ? 1 : 0 }}
            >
              {getGreeting}
            </h2>
            <p className='text-emerald-100 text-sm mt-1'>{t('数据看板')}</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <Button
            theme='solid'
            icon={<Search size={16} />}
            onClick={showSearchModal}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px'
            }}
          />
          <Button
            theme='solid'
            icon={<RefreshCw size={16} />}
            onClick={refresh}
            loading={loading}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
