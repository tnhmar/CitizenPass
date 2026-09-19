import { useState } from "react";
import { View, StyleSheet, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { useTheme } from "react-native-paper";
import { EXAM_PASS_THRESHOLD } from "../store/useExamStore";
import type { ExamAttempt } from "../services/persistence/progressRepository";
import { computeExamTrendPoints } from "../utils/examTrend";

const CHART_HEIGHT = 140;
const CHART_PADDING = 16;

type ExamTrendChartProps = {
  /** Chronological order, oldest first. */
  attempts: ExamAttempt[];
};

/**
 * Line chart of exam score (%) over time, with a dashed reference line
 * at the pass threshold. Width is measured via onLayout rather than
 * `Dimensions` so it stays correct across orientation/split-screen
 * changes without a subscription.
 */
export function ExamTrendChart({ attempts }: ExamTrendChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const points = computeExamTrendPoints(attempts, width, CHART_HEIGHT, CHART_PADDING);
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const passLineY = CHART_PADDING + (1 - EXAM_PASS_THRESHOLD) * usableHeight;
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <View onLayout={handleLayout} style={styles.container}>
      {width > 0 && (
        <Svg width={width} height={CHART_HEIGHT}>
          <Line
            x1={0}
            y1={passLineY}
            x2={width}
            y2={passLineY}
            stroke={theme.colors.outlineVariant}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          {points.length > 1 && <Polyline points={polylinePoints} fill="none" stroke={theme.colors.primary} strokeWidth={2} />}
          {points.map((point, index) => (
            <Circle key={index} cx={point.x} cy={point.y} r={4} fill={point.passed ? theme.colors.tertiary : theme.colors.error} />
          ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: CHART_HEIGHT },
});
