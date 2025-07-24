import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ErrorBar } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import _ from "lodash";

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5856D6', '#FF3B30', '#FF2D55', '#32D74B', '#64D2FF', '#BF5AF2'];

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="ios-card ios-blur rounded-2xl p-4 ios-shadow-lg border-0">
        <p className="text-gray-900 font-semibold text-base">{label}</p>
        <p className="text-gray-600 font-medium">평균: {data.value?.toFixed(4)} {unit}</p>
        {data.n !== undefined && <p className="text-gray-500 text-sm">샘플 수 (n): {data.n}</p>}
      </div>
    );
  }
  return null;
};

const ChartComponent = ({ data, unit }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-gray-500">이 항목에 대한 데이터가 없습니다.</p>
      </div>
    );
  }

  const dynamicBarSize = Math.max(20, Math.min(80, 600 / data.length));

  return (
    <div className="h-[400px] p-4 rounded-2xl bg-white/60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#374151" 
            fontSize={14} 
            fontWeight="600" 
            tick={{ fill: '#374151' }} 
            angle={0} 
            textAnchor="middle" 
            height={60} 
            interval={0} 
          />
          <YAxis 
            stroke="#374151" 
            fontSize={12} 
            fontWeight="600" 
            tick={{ fill: '#374151' }} 
            tickFormatter={(value) => value.toFixed(4)} 
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(142, 142, 147, 0.1)' }}/>
          <Bar dataKey="value" barSize={dynamicBarSize} radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            <ErrorBar dataKey="errorY" width={6} stroke="#374151" strokeWidth={2} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function ResultsChart({ results, analysisType }) {
  if (!results || results.length === 0) {
    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2"><BarChart3 className="h-5 w-5" /><span>시각화</span></CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center"><p className="text-gray-500 font-medium">시각화할 데이터가 없습니다</p></CardContent>
      </Card>
    );
  }

  const validResults = results.filter(r => r.concentration !== null && r.concentration !== undefined && r.compound);
  const uniqueCompounds = [...new Set(validResults.map(r => r.compound))];
  const uniqueFactors = [...new Set(validResults.map(r => r.factor))];
  const treatmentGroups = _.groupBy(validResults, 'treatment');
  const treatmentCount = Object.keys(treatmentGroups).length;
  const unit = analysisType === 'phenol' ? 'mg/g' : 'µmol/g dry wt.';

  const createCompoundChartData = (compound) => {
    return Object.entries(_.groupBy(validResults.filter(r => r.compound === compound), 'treatment')).map(([name, groupSamples]) => {
      const values = groupSamples.map(s => s.concentration);
      const mean = _.mean(values);
      const stdDev = groupSamples.length > 1 ? Math.sqrt(_.sumBy(values, val => Math.pow(val - mean, 2)) / (groupSamples.length - 1)) : 0;
      const stdErr = groupSamples.length > 1 ? stdDev / Math.sqrt(groupSamples.length) : 0;
      return { name, value: mean, errorY: stdErr, n: groupSamples.length };
    });
  };

  const createFactorChartData = (factor) => {
    return Object.entries(_.groupBy(validResults.filter(r => r.factor === factor), 'treatment')).map(([name, groupSamples]) => {
      const values = groupSamples.map(s => s.concentration);
      const mean = _.mean(values);
      const stdDev = groupSamples.length > 1 ? Math.sqrt(_.sumBy(values, val => Math.pow(val - mean, 2)) / (groupSamples.length - 1)) : 0;
      const stdErr = groupSamples.length > 1 ? stdDev / Math.sqrt(groupSamples.length) : 0;
      return { name, value: mean, errorY: stdErr, n: groupSamples.length };
    });
  };

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardContent className="space-y-6 pt-6">
        <div className="p-6 rounded-2xl bg-white/80 ios-shadow border border-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">총 샘플 수</p>
              <p className="text-gray-900 font-bold text-2xl">{validResults.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">총 처리구 수</p>
              <p className="text-gray-900 font-bold text-2xl">{treatmentCount}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="compound" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-lg rounded-xl shadow-xl p-2 border-0 h-12">
            <TabsTrigger value="compound" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-blue-600 rounded-lg font-semibold transition-all duration-200 text-sm">
              화합물별
            </TabsTrigger>
            <TabsTrigger value="factor" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-green-600 rounded-lg font-semibold transition-all duration-200 text-sm">
              Factor별
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="compound" className="mt-6">
            <Tabs defaultValue={uniqueCompounds[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-white/70 backdrop-blur-lg rounded-xl shadow-xl p-2 border-0 h-auto">
                {uniqueCompounds.map(compound => (
                  <TabsTrigger key={compound} value={compound} className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-blue-600 rounded-lg font-semibold transition-all duration-200 text-xs p-2">
                    {compound}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {uniqueCompounds.map(compound => (
                <TabsContent key={compound} value={compound} className="mt-6">
                  <ChartComponent data={createCompoundChartData(compound)} unit={unit} />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="factor" className="mt-6">
            <Tabs defaultValue={uniqueFactors[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-white/70 backdrop-blur-lg rounded-xl shadow-xl p-2 border-0 h-auto">
                {uniqueFactors.map(factor => (
                  <TabsTrigger key={factor} value={factor} className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-green-600 rounded-lg font-semibold transition-all duration-200 text-xs p-2">
                    {factor}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {uniqueFactors.map(factor => (
                <TabsContent key={factor} value={factor} className="mt-6">
                  <ChartComponent data={createFactorChartData(factor)} unit={unit} />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}