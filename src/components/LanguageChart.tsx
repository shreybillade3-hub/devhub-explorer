import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const colors = ['#5b5ff0', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#64748b']

export default function LanguageChart({ data }: { data: { language: string; count: number }[] }) {
  if (data.length === 0) return null
  const top = data.slice(0, 8)
  return (
    <section
      aria-labelledby="lang-title"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 id="lang-title" className="mb-2 text-base font-semibold">
        Languages by repository count
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="language" width={90} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#94a3b822' }} contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="count" name="Repositories" isAnimationActive={false} radius={[0, 6, 6, 0]}>
              {top.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
