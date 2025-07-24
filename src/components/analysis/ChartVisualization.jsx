import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, Cell } from "recharts";
import _ from "lodash";

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5856D6', '#FF3B30', '#FF2D55', '#32D74B', '#64D2FF', '#BF5AF2'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="ios-card ios-blur rounded-2xl p-4 ios-shadow-lg border-0">
        <p className="text-gray-900 font-semibold text-base">{label}</p>
        <p className="text-gray-600 font-medium">평균: {data.value?.toFixed(3)} {data.unit}</p>
        {data.n !== undefined && <p className="text-gray-500 text-sm">샘플 수 (n): {data.n}</p>}
      </div>
    );
  }
  return null;
};

const ChartComponent = ({ data, unit }) => {
  const MAX_BAR_SIZE = 80;
  const MIN_BAR_SIZE = 20;
  const dynamicBarSize = Math.max(
    MIN_BAR_SIZE, 
    Math.min(MAX_BAR_SIZE, 600 / data.length)
  );

  return (
    <div className="h-[500px] p-4 rounded-2xl bg-white/60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#374151" 
            fontSize={16} 
            fontWeight="600"
            tick={{ fill: '#374151' }}
            angle={0}
            textAnchor="middle"
            height={80}
            interval={0}
          />
          <YAxis 
            domain={[0, 'dataMax']}
            stroke="#374151" 
            fontSize={16} 
            fontWeight="600" 
            tick={{ fill: '#374151' }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(142, 142, 147, 0.1)' }}/>
          <Bar dataKey="value" barSize={dynamicBarSize} radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <ErrorBar dataKey="errorY" width={6} stroke="#374151" strokeWidth={2} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function ChartVisualization({ samples }) {
  if (samples.length === 0) {
    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 font-medium text-lg">시각화할 데이터가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  const treatmentGroups = _.groupBy(samples, 'treatment_name');
  const treatmentCount = Object.keys(treatmentGroups).length;

  // 엽록소 및 카로티노이드 분석인 경우 탭 형태로 표시
  if (samples[0]?.analysis_type === "chlorophyll_a_b") {
    const createChartData = (valueKey, unit) => {
      return Object.entries(treatmentGroups).map(([name, groupSamples]) => {
        const values = groupSamples.map(s => s[valueKey] || 0);
        const mean = _.mean(values);
        const stdDev = groupSamples.length > 1 
            ? Math.sqrt(_.sumBy(values, val => Math.pow(val - mean, 2)) / (groupSamples.length - 1))
            : 0; 
        const stdErr = groupSamples.length > 1 ? stdDev / Math.sqrt(groupSamples.length) : 0;
        return {
          name,
          value: mean,
          errorY: stdErr,
          unit: unit,
          n: groupSamples.length
        };
      });
    };

    const chlAData = createChartData('chl_a', 'μg/ml');
    const chlBData = createChartData('chl_b', 'μg/ml');
    const totalChlData = Object.entries(treatmentGroups).map(([name, groupSamples]) => {
      const values = groupSamples.map(s => (s.chl_a || 0) + (s.chl_b || 0));
      const mean = _.mean(values);
      const stdDev = groupSamples.length > 1 
          ? Math.sqrt(_.sumBy(values, val => Math.pow(val - mean, 2)) / (groupSamples.length - 1))
          : 0; 
      const stdErr = groupSamples.length > 1 ? stdDev / Math.sqrt(groupSamples.length) : 0;
      return {
        name,
        value: mean,
        errorY: stdErr,
        unit: 'μg/ml',
        n: groupSamples.length
      };
    });
    const carotenoidData = createChartData('carotenoid', 'μg/ml');

    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
        <CardContent className="space-y-6 pt-6">
          <div className="p-6 rounded-2xl bg-white/80 ios-shadow border border-gray-100/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">총 샘플 수</p>
                <p className="text-gray-900 font-bold text-2xl">{samples.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">총 처리구 수</p>
                <p className="text-gray-900 font-bold text-2xl">{treatmentCount}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="chl_a" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-xl p-2 border-0 h-12">
              <TabsTrigger value="chl_a" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-blue-600 rounded-lg font-semibold transition-all duration-200 text-sm">
                엽록소 a
              </TabsTrigger>
              <TabsTrigger value="chl_b" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-green-600 rounded-lg font-semibold transition-all duration-200 text-sm">
                엽록소 b
              </TabsTrigger>
              <TabsTrigger value="total_chl" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-orange-600 rounded-lg font-semibold transition-all duration-200 text-sm">
                총 엽록소
              </TabsTrigger>
              <TabsTrigger value="carotenoid" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-purple-600 rounded-lg font-semibold transition-all duration-200 text-sm">
                카로티노이드
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chl_a" className="mt-6">
              <ChartComponent data={chlAData} unit="μg/ml" />
            </TabsContent>
            
            <TabsContent value="chl_b" className="mt-6">
              <ChartComponent data={chlBData} unit="μg/ml" />
            </TabsContent>
            
            <TabsContent value="total_chl" className="mt-6">
              <ChartComponent data={totalChlData} unit="μg/ml" />
            </TabsContent>
            
            <TabsContent value="carotenoid" className="mt-6">
              <ChartComponent data={carotenoidData} unit="μg/ml" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // 기존 단일 값 분석
  const chartData = Object.entries(treatmentGroups)
    .map(([name, groupSamples]) => {
      const values = groupSamples.map(s => s.result);
      const mean = _.mean(values);
      const stdDev = groupSamples.length > 1 
          ? Math.sqrt(_.sumBy(values, val => Math.pow(val - mean, 2)) / (groupSamples.length - 1))
          : 0; 
      const stdErr = groupSamples.length > 1 ? stdDev / Math.sqrt(groupSamples.length) : 0;
      return {
        name,
        value: mean,
        errorY: stdErr,
        unit: groupSamples[0]?.unit,
        n: groupSamples.length,
        rawValues: values
      };
    });

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardContent className="space-y-6 pt-6">
        <div className="p-6 rounded-2xl bg-white/80 ios-shadow border border-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">총 샘플 수</p>
              <p className="text-gray-900 font-bold text-2xl">{samples.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">총 처리구 수</p>
              <p className="text-gray-900 font-bold text-2xl">{treatmentCount}</p>
            </div>
          </div>
        </div>

        <ChartComponent data={chartData} unit={samples[0]?.unit} />
      </CardContent>
    </Card>
  );
}