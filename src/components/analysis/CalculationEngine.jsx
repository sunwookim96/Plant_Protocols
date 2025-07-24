
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  TrendingUp,
  BarChart,
  Percent,
  Target
} from "lucide-react";
import _ from "lodash";

const StatCard = ({ title, value, unit, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800"
  };
  
  const noSpace = unit && (unit.startsWith('%') || unit.startsWith('°C'));

  return (
    <div className={`p-4 rounded-2xl border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold">{value}</p>
        {unit && <p className={`text-sm font-semibold opacity-80 ${noSpace ? 'ml-0.5' : 'ml-2'}`}>{unit}</p>}
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

  // 엽록소 및 카로티노이드 분석인 경우 다중 값 표시
  if (samples[0]?.analysis_type === "chlorophyll_a_b") {
    const chlAResults = samples.map(s => s.chl_a || 0);
    const chlBResults = samples.map(s => s.chl_b || 0);
    const totalChlResults = samples.map(s => (s.chl_a || 0) + (s.chl_b || 0));
    const carotenoidResults = samples.map(s => s.carotenoid || 0);

    const chlAMean = _.mean(chlAResults);
    const chlBMean = _.mean(chlBResults);
    const totalChlMean = _.mean(totalChlResults);
    const carotenoidMean = _.mean(carotenoidResults);

    const chlAStdErr = samples.length > 1 ? Math.sqrt(_.sumBy(chlAResults, r => Math.pow(r - chlAMean, 2)) / (samples.length - 1)) / Math.sqrt(samples.length) : 0;
    const chlBStdErr = samples.length > 1 ? Math.sqrt(_.sumBy(chlBResults, r => Math.pow(r - chlBMean, 2)) / (samples.length - 1)) / Math.sqrt(samples.length) : 0;
    const totalChlStdErr = samples.length > 1 ? Math.sqrt(_.sumBy(totalChlResults, r => Math.pow(r - totalChlMean, 2)) / (samples.length - 1)) / Math.sqrt(samples.length) : 0;
    const carotenoidStdErr = samples.length > 1 ? Math.sqrt(_.sumBy(carotenoidResults, r => Math.pow(r - carotenoidMean, 2)) / (samples.length - 1)) / Math.sqrt(samples.length) : 0;

    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 h-full">
        <CardHeader>
          <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>통계 결과 ({samples.length}개 선택)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              title="엽록소 a 평균"
              value={chlAMean.toFixed(3)}
              unit="μg/ml"
              icon={<Target className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              title="엽록소 a 표준오차"
              value={chlAStdErr.toFixed(3)}
              unit="μg/ml"
              icon={<TrendingUp className="h-4 w-4" />}
              color="blue"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              title="엽록소 b 평균"
              value={chlBMean.toFixed(3)}
              unit="μg/ml"
              icon={<Target className="h-4 w-4" />}
              color="green"
            />
            <StatCard
              title="엽록소 b 표준오차"
              value={chlBStdErr.toFixed(3)}
              unit="μg/ml"
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              title="총 엽록소 평균"
              value={totalChlMean.toFixed(3)}
              unit="μg/ml"
              icon={<Target className="h-4 w-4" />}
              color="orange"
            />
            <StatCard
              title="총 엽록소 표준오차"
              value={totalChlStdErr.toFixed(3)}
              unit="μg/ml"
              icon={<TrendingUp className="h-4 w-4" />}
              color="orange"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              title="카로티노이드 평균"
              value={carotenoidMean.toFixed(3)}
              unit="μg/ml"
              icon={<Target className="h-4 w-4" />}
              color="purple"
            />
            <StatCard
              title="카로티노이드 표준오차"
              value={carotenoidStdErr.toFixed(3)}
              unit="μg/ml"
              icon={<TrendingUp className="h-4 w-4" />}
              color="purple"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 기존 단일 값 분석
  const results = samples.map(s => s.result);
  const mean = _.mean(results) || 0;
  const stdDev = samples.length > 1 ? Math.sqrt(_.sumBy(results, r => Math.pow(r - mean, 2)) / (samples.length - 1)) : 0;
  const stdErr = samples.length > 1 ? stdDev / Math.sqrt(samples.length) : 0;
  const variance = stdDev * stdDev;
  const cv = mean !== 0 ? (stdDev / mean) * 100 : 0;
  const unit = samples[0]?.unit;

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
      </CardContent>
    </Card>
  );
}
