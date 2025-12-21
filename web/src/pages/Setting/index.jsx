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

import { Collapse, Layout, TabPane, Tabs } from '@douyinfe/semi-ui';
import {
    Calculator,
    Cog,
    CreditCard,
    Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import ChatsSetting from '../../components/settings/ChatsSetting';
import DashboardSetting from '../../components/settings/DashboardSetting';
import DrawingSetting from '../../components/settings/DrawingSetting';
import ModelSetting from '../../components/settings/ModelSetting';
import OperationSetting from '../../components/settings/OperationSetting';
import OtherSetting from '../../components/settings/OtherSetting';
import PaymentSetting from '../../components/settings/PaymentSetting';
import RateLimitSetting from '../../components/settings/RateLimitSetting';
import RatioSetting from '../../components/settings/RatioSetting';
import SystemSetting from '../../components/settings/SystemSetting';
import { isRoot } from '../../helpers';

// 合并的功能设置组件
const FeatureSetting = () => {
  const { t } = useTranslation();
  return (
    <Collapse defaultActiveKey={['dashboard']}>
      <Collapse.Panel header={t('仪表盘设置')} itemKey='dashboard'>
        <DashboardSetting />
      </Collapse.Panel>
      <Collapse.Panel header={t('聊天设置')} itemKey='chats'>
        <ChatsSetting />
      </Collapse.Panel>
      <Collapse.Panel header={t('绘图设置')} itemKey='drawing'>
        <DrawingSetting />
      </Collapse.Panel>
    </Collapse>
  );
};

// 合并的模型设置组件
const ModelFullSetting = () => {
  const { t } = useTranslation();
  return (
    <Collapse defaultActiveKey={['ratio']}>
      <Collapse.Panel header={t('分组与定价')} itemKey='ratio'>
        <RatioSetting />
      </Collapse.Panel>
      <Collapse.Panel header={t('速率限制')} itemKey='ratelimit'>
        <RateLimitSetting />
      </Collapse.Panel>
      <Collapse.Panel header={t('模型配置')} itemKey='models'>
        <ModelSetting />
      </Collapse.Panel>
    </Collapse>
  );
};

// 合并的系统设置组件
const SystemFullSetting = () => {
  const { t } = useTranslation();
  return (
    <Collapse defaultActiveKey={['system']}>
      <Collapse.Panel header={t('系统设置')} itemKey='system'>
        <SystemSetting />
      </Collapse.Panel>
      <Collapse.Panel header={t('其他设置')} itemKey='other'>
        <OtherSetting />
      </Collapse.Panel>
    </Collapse>
  );
};

const Setting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabActiveKey, setTabActiveKey] = useState('operation');
  let panes = [];

  if (isRoot()) {
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Settings size={18} />
          {t('运营设置')}
        </span>
      ),
      content: <OperationSetting />,
      itemKey: 'operation',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Cog size={18} />
          {t('功能设置')}
        </span>
      ),
      content: <FeatureSetting />,
      itemKey: 'feature',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CreditCard size={18} />
          {t('支付设置')}
        </span>
      ),
      content: <PaymentSetting />,
      itemKey: 'payment',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calculator size={18} />
          {t('模型设置')}
        </span>
      ),
      content: <ModelFullSetting />,
      itemKey: 'model',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Cog size={18} />
          {t('系统设置')}
        </span>
      ),
      content: <SystemFullSetting />,
      itemKey: 'system',
    });
  }
  const onChangeTab = (key) => {
    setTabActiveKey(key);
    navigate(`?tab=${key}`);
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setTabActiveKey(tab);
    } else {
      onChangeTab('operation');
    }
  }, [location.search]);
  return (
    <div className='page-container'>
      <Layout>
        <Layout.Content>
          <Tabs
            type='card'
            collapsible
            activeKey={tabActiveKey}
            onChange={(key) => onChangeTab(key)}
          >
            {panes.map((pane) => (
              <TabPane itemKey={pane.itemKey} tab={pane.tab} key={pane.itemKey}>
                {tabActiveKey === pane.itemKey && pane.content}
              </TabPane>
            ))}
          </Tabs>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default Setting;
