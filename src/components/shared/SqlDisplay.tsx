import { Highlight, themes } from 'prism-react-renderer';

interface SqlDisplayProps {
  sql: string;
  title?: string;
}

export default function SqlDisplay({ sql, title }: SqlDisplayProps) {
  return (
    <div>
      {title && (
        <p className="text-xs uppercase text-slate-400 mb-2">{title}</p>
      )}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-x-auto">
        <Highlight theme={themes.nightOwl} code={sql.trim()} language="sql">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} font-mono text-sm`}
              style={{ ...style, background: 'transparent', margin: 0 }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
