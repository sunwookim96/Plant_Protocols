import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  TrendingUp, 
  BarChart, 
  Percent, 
  Target, 
  ArrowDown,
  ArrowUp,
  Scale 
} from "lucide-react";
import _ from "lodash";

const StatCard = ({ title, value, unit, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800", 
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    red: "bg-red-50 border-red-200 text-red-800",
    gray: "bg-gray-100 border-gray-300 text-gray-800"
  };

  return (
    <div className={`p-4 rounded-2xl border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold">{value}</p>
        {unit && <p className="text-sm font-semibold opacity-80">{unit}</p>}
      </div>
    </div>
  );
};

export default function CalculationEngine({ samples }) {
  if (samples.length === 0) {
    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 h-full">
        <CardHeader>
          <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>통계 결과</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 font-medium text-base">분석할 샘플을 선택해주세요.</p>
        </CardContent>
      </Card>
    );
  }

  const results = samples.map(s => s.result);
  const mean = _.mean(results) || 0;
  const stdDev = samples.length > 1 ? Math.sqrt(_.sumBy(results, r => Math.pow(r - mean, 2)) / (samples.length - 1)) : 0;
  const stdErr = samples.length > 1 ? stdDev / Math.sqrt(samples.length) : 0;
  const variance = stdDev * stdDev;
  const cv = mean !== 0 ? (stdDev / mean) * 100 : 0;
  const unit = samples[0]?.unit;
  
  const min = _.min(results) || 0;
  const max = _.max(results) || 0;

  const calculateMedian = (arr) => {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  const median = calculateMedian(results);

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 h-full">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>통계 결과 ({samples.length}개 선택)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard 
          title="평균 (Mean)" 
          value={mean.toFixed(3)} 
          unit={unit} 
          icon={<Target className="h-4 w-4" />}
          color="blue"
        />
        <StatCard 
          title="표준오차 (SE)" 
          value={stdErr.toFixed(3)} 
          unit={unit} 
          icon={<TrendingUp className="h-4 w-4" />}
          color="green"
        />
        <StatCard 
          title="분산 (Variance)" 
          value={variance.toFixed(3)} 
          icon={<BarChart className="h-4 w-4" />}
          color="orange"
        />
        <StatCard 
          title="변동계수 (CV)" 
          value={`${cv.toFixed(2)}%`} 
          icon={<Percent className="h-4 w-4" />}
          color="purple"
        />
        <StatCard 
          title="최소값 (Min)" 
          value={min.toFixed(3)} 
          unit={unit} 
          icon={<ArrowDown className="h-4 w-4" />}
          color="red"
        />
        <StatCard 
          title="최대값 (Max)" 
          value={max.toFixed(3)} 
          unit={unit} 
          icon={<ArrowUp className="h-4 w-4" />}
          color="blue"
        />
        <StatCard 
          title="중앙값 (Median)" 
          value={median.toFixed(3)} 
          unit={unit} 
          icon={<Scale className="h-4 w-4" />}
          color="gray"
        />
      </CardContent>
    </Card>
  );
}