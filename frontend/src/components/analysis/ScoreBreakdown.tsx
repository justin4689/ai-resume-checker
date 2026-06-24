import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

interface ScoreBreakdownProps {
  breakdown?: { label: string; value: number }[];
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  if (!breakdown || breakdown.length === 0) return null;
  const data = breakdown.map((d) => ({ axis: d.label, v: d.value, full: 100 }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="text-base">Score Breakdown</CardTitle>
          <CardDescription className="mt-1">Each axis scored out of 100</CardDescription>
        </div>
      </CardHeader>
      <div className="h-[230px] -mx-2">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="v"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[var(--border)]">
        {data.slice(0, 4).map((d) => (
          <div key={d.axis} className="text-center">
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
              {d.axis}
            </div>
            <div className="font-display tabular text-lg font-semibold mt-0.5">
              {d.v}
              <span className="text-xs text-[var(--ink-muted)] font-normal ml-0.5">
                /100
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
