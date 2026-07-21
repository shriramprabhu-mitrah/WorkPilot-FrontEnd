"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import { useResize } from "@/src/hooks/useResize";

interface LineChartProps {
  option: EChartsOption;
  height?: number | string;
  className?: string;
}

const LineChart = forwardRef<ReactEcharts, LineChartProps>(
  ({ option, height = 240, className = "" }, ref) => {
    const innerRef = useRef<ReactEcharts | null>(null);
    const { width } = useResize();
    const [renderVersion, setRenderVersion] = useState(0);
    const optionSignature = useMemo(() => JSON.stringify(option), [option]);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        setRenderVersion((value) => value + 1);
      }, 0);

      return () => window.clearTimeout(timer);
    }, [width, height, optionSignature]);

    useEffect(() => {
      innerRef.current?.getEchartsInstance().resize();
    }, [width, renderVersion]);

    return (
      <div className={className} style={{ height }}>
        <ReactEcharts
          key={renderVersion}
          notMerge
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as React.MutableRefObject<ReactEcharts | null>).current =
                node;
          }}
          echarts={echarts}
          option={option}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    );
  },
);

LineChart.displayName = "LineChart";
export default LineChart;
