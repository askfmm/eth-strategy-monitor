import React, { useState, useEffect } from 'react';
import { Shield, Globe, Zap, FileText, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const DataRow = ({ label, value, status }: { label: string, value: string, status?: 'up' | 'down' | 'neutral' }) => {
  let valueColor = 'text-text-main';
  if (status === 'up') valueColor = 'text-up';
  if (status === 'down') valueColor = 'text-down';

  return (
    <div className="flex justify-between py-2.5 border-b border-[#21262d] last:border-0">
      <span className="text-sm text-text-main/90">{label}</span>
      <span className={`font-mono font-bold ${valueColor}`}>{value}</span>
    </div>
  );
};

const Card = ({ title, icon: Icon, children, className = '' }: { title: string, icon: React.ElementType, children: React.ReactNode, className?: string }) => (
  <div className={`bg-bg-card border border-border-card rounded-xl p-5 relative shadow-lg shadow-black/20 ${className}`}>
    <div className="text-eth text-lg font-bold mb-5 flex items-center gap-2.5">
      <Icon className="w-5 h-5" />
      {title}
    </div>
    {children}
  </div>
);

export default function App() {
  const [time, setTime] = useState(new Date());
  const [marketData, setMarketData] = useState({
    price: '0.00',
    change: '0.00',
    high: '0.00',
    low: '0.00',
    vol: '0.00'
  });

  const [indicatorData, setIndicatorData] = useState({
    rsi: 58.0,
    signalType: 'hold',
    signalText: '⏳ 持仓观望 (WAIT)',
    signalClass: 'bg-warn/10 border-warn text-warn',
    bbPosition: '中轨支撑'
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market');
        const data = await res.json();
        if (data && data.lastPrice) {
          setMarketData({
            price: parseFloat(data.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: parseFloat(data.priceChangePercent).toFixed(2),
            high: parseFloat(data.highPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            low: parseFloat(data.lowPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            vol: (parseFloat(data.quoteVolume) / 1000000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M'
          });
        }
      } catch (e) {
        console.error("Failed to fetch market data from backend", e);
      }
    };

    const fetchIndicators = async () => {
      try {
        const res = await fetch('/api/indicators');
        const data = await res.json();
        if (data && data.rsi) {
          let bbPosition = '中轨支撑';
          if (data.price > data.bb.upper) bbPosition = '突破上轨 (超买)';
          else if (data.price < data.bb.lower) bbPosition = '跌破下轨 (超卖)';
          else if (data.price > data.bb.middle) bbPosition = '中轨上方 (偏多)';
          else bbPosition = '中轨下方 (偏空)';

          setIndicatorData({
            rsi: data.rsi,
            signalType: data.signalType,
            signalText: data.signalText,
            signalClass: data.signalClass,
            bbPosition
          });
        }
      } catch (e) {
        console.error("Failed to fetch indicators from backend", e);
      }
    };
    
    fetchMarketData();
    fetchIndicators();
    const interval = setInterval(() => {
      fetchMarketData();
      fetchIndicators();
    }, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-main text-text-main p-4 md:p-8 font-sans selection:bg-eth/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-eth pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold m-0 flex items-center gap-3">
              ETH 策略监控系统
              <span className="text-warn text-xs md:text-sm font-normal px-2 py-1 bg-warn/10 rounded border border-warn/20 tracking-wider">
                全仓模式
              </span>
            </h1>
          </div>
          <div className="font-mono text-lg bg-bg-card px-4 py-1.5 rounded-lg border border-border-card shadow-inner">
            {time.toLocaleString('zh-CN', { hour12: false })}
          </div>
        </header>

        {/* Market Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-bg-card border border-border-card rounded-xl p-4 mb-6 shadow-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-eth/20 border border-eth/50 rounded-full flex items-center justify-center text-eth font-bold text-xl">
              Ξ
            </div>
            <div>
              <div className="text-sm text-text-main/70 font-medium flex items-center gap-1">
                <Activity className="w-3 h-3" /> ETH/USDT 实时行情
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-mono font-bold">${marketData.price}</span>
                <span className={`text-sm font-bold ${parseFloat(marketData.change) >= 0 ? 'text-up' : 'text-down'}`}>
                  {parseFloat(marketData.change) >= 0 ? '+' : ''}{marketData.change}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex flex-col min-w-max">
              <span className="text-xs text-text-main/60">24h 最高 (High)</span>
              <span className="font-mono text-sm">${marketData.high}</span>
            </div>
            <div className="flex flex-col min-w-max">
              <span className="text-xs text-text-main/60">24h 最低 (Low)</span>
              <span className="font-mono text-sm">${marketData.low}</span>
            </div>
            <div className="flex flex-col min-w-max">
              <span className="text-xs text-text-main/60">24h 成交额 (Vol)</span>
              <span className="font-mono text-sm">${marketData.vol}</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Internal Ecosystem */}
          <Card title="生态内因 (Internal Ecosystem)" icon={Shield}>
            <div className="space-y-0.5">
              <DataRow label="净发行率 (Net Issuance)" value="-0.12% (通缩)" status="up" />
              <DataRow label="质押参与率 (Staking)" value="31.4%" />
              <DataRow label="L2 结算收入 (L1 Revenue)" value="High" status="up" />
              <DataRow label="RWA 锁定总值 (TVL)" value="$18.2B" />
              <DataRow label="主网 Gas 基础费" value="14 Gwei" />
            </div>
            <p className="text-xs text-[#8b949e] mt-5 flex items-center gap-1.5">
              <span className="text-eth">*</span> 逻辑：通缩 + RWA 增长 = 价格内生动力
            </p>
          </Card>

          {/* External Factors */}
          <Card title="宏观外因 (External Factors)" icon={Globe}>
            <div className="space-y-0.5">
              <DataRow label="ETF 每日净流入" value="+$142M" status="up" />
              <DataRow label="美元指数 (DXY)" value="101.2 (走弱)" status="down" />
              <DataRow label="ETH/BTC 汇率" value="0.0292" status="down" />
              <DataRow label="降息预期 (Fed Watch)" value="25bps (March)" />
              <DataRow label="机构持仓比例" value="8.4%" />
            </div>
            <p className="text-xs text-[#8b949e] mt-5 flex items-center gap-1.5">
              <span className="text-eth">*</span> 逻辑：ETF 流入 + 美元走弱 = 外部推力
            </p>
          </Card>

          {/* Confluence Signal */}
          <Card title="策略共振信号 (Confluence Signal)" icon={Zap}>
            <div 
              key={indicatorData.signalType}
              className={`text-center p-5 rounded-xl text-xl md:text-2xl font-bold mt-1 mb-5 border-2 shadow-lg transition-all duration-300 ${indicatorData.signalClass}`}
            >
              {indicatorData.signalText}
            </div>
            <div className="space-y-0.5">
              <DataRow label="RSI (周线 14W)" value={indicatorData.rsi.toFixed(1)} />
              <DataRow label="EMA 20/50/200 (周线)" value="金叉 (多头排列)" status="up" />
              <DataRow label="背离扫描 (Divergence)" value="无显著背离" />
              <DataRow label="布林带位置 (周线)" value={indicatorData.bbPosition} />
            </div>
          </Card>
        </div>

        {/* Execution Logic */}
        <div className="mt-6">
          <Card title="顾问执行逻辑说明" icon={FileText} className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
              <div className="bg-bg-main p-5 rounded-lg border border-border-card hover:border-up/30 transition-colors">
                <strong className="text-up flex items-center gap-2 mb-3 text-base">
                  <TrendingUp className="w-5 h-5" /> 强抄底共振：
                </strong>
                <ul className="list-decimal list-inside space-y-2 text-text-main/80 marker:text-text-main/40">
                  <li>RSI &lt; 35 且底背离</li>
                  <li>触碰布林带下轨</li>
                  <li>内因显示处于通缩状态</li>
                </ul>
              </div>
              <div className="bg-bg-main p-5 rounded-lg border border-border-card hover:border-down/30 transition-colors">
                <strong className="text-down flex items-center gap-2 mb-3 text-base">
                  <TrendingDown className="w-5 h-5" /> 强逃顶共振：
                </strong>
                <ul className="list-decimal list-inside space-y-2 text-text-main/80 marker:text-text-main/40">
                  <li>RSI &gt; 70 且顶背离</li>
                  <li>偏离布林带上轨过远</li>
                  <li>ETF 连续 3 日净流出</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
