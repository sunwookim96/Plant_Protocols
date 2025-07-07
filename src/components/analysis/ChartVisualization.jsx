
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, Cell } from "recharts";
import { BarChart3, Users, FlaskConical, Box } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import _ from "lodash";
import { motion } from "framer-motion";

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

const BoxPlotVisualization = ({ data }) => {
  const calculateBoxPlotStats = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const min = Math.max(sorted[0], q1 - 1.5 * iqr);
    const max = Math.min(sorted[n - 1], q3 + 1.5 * iqr);
    const outliers = sorted.filter(v => v < min || v > max);
    
    return { min, q1, median, q3, max, outliers, values: sorted };
  };

  const chartData = data.map((item, index) => {
    const stats = calculateBoxPlotStats(item.rawValues || [item.value]);
    return {
      name: item.name,
      ...stats,
      color: COLORS[index % COLORS.length]
    };
  });

  const allValues = data.flatMap(item => item.rawValues || [item.value]);
  // Handle empty allValues case to prevent Math.min/max errors
  const yMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const yMax = allValues.length > 0 ? Math.max(...allValues) : 1;

  // Define Y-axis domain more robustly for potential negative values or zero
  const yAxisDomain = [yMin > 0 ? yMin * 0.95 : yMin * 1.05, yMax > 0 ? yMax * 1.05 : yMax * 0.95];
  // Adjust domain if yMin and yMax are the same, preventing division by zero.
  if (yAxisDomain[0] === yAxisDomain[1]) {
    yAxisDomain[0] = yAxisDomain[0] - 0.1;
    yAxisDomain[1] = yAxisDomain[1] + 0.1;
  }

  return (
    <div className="h-96 p-4 rounded-2xl bg-white/60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#374151" 
            fontSize={16} 
            fontWeight="600"
            tick={{ fill: '#374151' }}
            angle={0}
            textAnchor="middle"
            height={60}
            interval={0}
          />
          <YAxis 
            domain={yAxisDomain}
            stroke="#374151" 
            fontSize={16} 
            fontWeight="600" 
            tick={{ fill: '#374151' }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="ios-card ios-blur rounded-2xl p-4 ios-shadow-lg border-0">
                    <p className="text-gray-900 font-semibold text-base">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p>최솟값: {data.min?.toFixed(3)}</p>
                      <p>Q1: {data.q1?.toFixed(3)}</p>
                      <p>중앙값: {data.median?.toFixed(3)}</p>
                      <p>Q3: {data.q3?.toFixed(3)}</p>
                      <p>최댓값: {data.max?.toFixed(3)}</p>
                      <p>이상치: {data.outliers?.length || 0}개</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="q3" fill="transparent" />
          {chartData.map((entry, index) => {
            const chartHeight = 384; // h-96 is 384px
            const topMargin = 20;
            const bottomMargin = 60;
            const plotAreaHeight = chartHeight - topMargin - bottomMargin; // 384 - 20 - 60 = 304px

            const barYRange = (yAxisDomain[1] - yAxisDomain[0]) || 1;
            
            // yScale maps data value to pixel y-coordinate.
            // y=topMargin for yAxisDomain[1] (max value), y=topMargin+plotAreaHeight for yAxisDomain[0] (min value)
            const yScale = (value) => topMargin + plotAreaHeight - ((value - yAxisDomain[0]) / barYRange) * plotAreaHeight;
            
            const bandWidth = 50; // Fixed width for the box plot elements
            // Calculate x-position for the center of each box
            const chartWidth = 600; // This seems to be a conceptual width from original code
            const leftMargin = 20;
            const rightMargin = 30;
            const effectiveChartWidth = chartWidth - leftMargin - rightMargin;
            const x = (index * effectiveChartWidth / chartData.length) + leftMargin + effectiveChartWidth / (2 * chartData.length); // Centering each box

            if (isNaN(yScale(entry.q3)) || isNaN(yScale(entry.q1))) return null;

            return (
              <g key={entry.name}>
                {/* Box */}
                <rect
                  x={x - bandWidth/2}
                  y={yScale(entry.q3)}
                  width={bandWidth}
                  height={yScale(entry.q1) - yScale(entry.q3)}
                  fill={entry.color}
                  fillOpacity={0.3}
                  stroke={entry.color}
                  strokeWidth={2}
                />
                {/* Median line */}
                <line
                  x1={x - bandWidth/2}
                  y1={yScale(entry.median)}
                  x2={x + bandWidth/2}
                  y2={yScale(entry.median)}
                  stroke={entry.color}
                  strokeWidth={3}
                />
                {/* Whiskers */}
                <line
                  x1={x}
                  y1={yScale(entry.q3)}
                  x2={x}
                  y2={yScale(entry.max)}
                  stroke={entry.color}
                  strokeWidth={2}
                />
                <line
                  x1={x}
                  y1={yScale(entry.q1)}
                  x2={x}
                  y2={yScale(entry.min)}
                  stroke={entry.color}
                  strokeWidth={2}
                />
                {/* Min/Max caps */}
                <line
                  x1={x - bandWidth/4}
                  y1={yScale(entry.max)}
                  x2={x + bandWidth/4}
                  y2={yScale(entry.max)}
                  stroke={entry.color}
                  strokeWidth={2}
                />
                <line
                  x1={x - bandWidth/4}
                  y1={yScale(entry.min)}
                  x2={x + bandWidth/4}
                  y2={yScale(entry.min)}
                  stroke={entry.color}
                  strokeWidth={2}
                />
                {/* Outliers */}
                {entry.outliers.map((outlier, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={yScale(outlier)}
                    r={3}
                    fill={entry.color}
                  />
                ))}
              </g>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function ChartVisualization({ samples }) {
  const [groupByTreatment, setGroupByTreatment] = useState(true);

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

  let chartData;
  if (groupByTreatment) {
    chartData = Object.entries(treatmentGroups)
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
  } else {
    chartData = samples.map(sample => ({
      name: sample.sample_name,
      value: sample.result,
      unit: sample.unit,
      rawValues: [sample.result]
    }));
  }

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900 text-xl font-semibold">데이터 시각화</CardTitle>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-gray-500" />
            <Label htmlFor="group-switch" className="text-sm font-medium text-gray-600">처리구별</Label>
            <Switch
              id="group-switch"
              checked={groupByTreatment}
              onCheckedChange={setGroupByTreatment}
            />
            <Label htmlFor="group-switch" className="text-sm font-medium text-gray-600">샘플별</Label>
             <FlaskConical className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
           key={groupByTreatment ? "grouped" : "individual"} // Key change for motion to detect data change and animate
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.5 }}
        >
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 ios-card ios-blur rounded-2xl ios-shadow p-2 border-0 h-12">
            <TabsTrigger 
              value="bar" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:ios-shadow data-[state=active]:text-blue-600 text-gray-600 rounded-xl h-8 font-semibold transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span>막대그래프</span>
            </TabsTrigger>
            <TabsTrigger 
              value="box" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:ios-shadow data-[state=active]:text-blue-600 text-gray-600 rounded-xl h-8 font-semibold transition-all duration-200"
            >
              <Box className="h-4 w-4" />
              <span>박스플롯</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="mt-6">
            <div className="h-96 p-4 rounded-2xl bg-white/60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#374151" 
                    fontSize={16} 
                    fontWeight="600"
                    tick={{ fill: '#374151' }}
                    angle={0}
                    textAnchor="middle"
                    height={60}
                    interval={0}
                  />
                  <YAxis 
                    domain={[0, 'dataMax']} // Changed from 'dataMax + 10%' to 'dataMax'
                    stroke="#374151" 
                    fontSize={16} 
                    fontWeight="600" 
                    tick={{ fill: '#374151' }}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(142, 142, 147, 0.1)' }}/>
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {groupByTreatment && <ErrorBar dataKey="errorY" width={6} stroke="#374151" strokeWidth={2} />}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="box" className="mt-6">
            <BoxPlotVisualization data={chartData} />
          </TabsContent>
        </Tabs>
        </motion.div>
        
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
      </CardContent>
    </Card>
  );
}
