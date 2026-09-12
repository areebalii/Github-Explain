import { Loader2, GitCommit, GitPullRequest, User, AlertCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ExplanationPanel({ explanation, isLoading, selectedLine }) {
  if (!selectedLine && !isLoading && !explanation) {
    return (
      <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-200 bg-white p-8 flex flex-col items-center justify-center text-center flex-shrink-0 min-h-[16rem]">
        <div className="bg-gray-50 p-4 rounded-full mb-4 border border-gray-100">
          <GitCommit className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">No Line Selected</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Tap any line in the code view to trace its commit history and purpose.
        </p>
      </aside>
    );
  }

  const context = explanation?.contextFetched;

  return (
    <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-200 bg-white flex flex-col h-full flex-shrink-0 shadow-2xl md:shadow-none z-10">
      <div className="p-4 md:p-5 border-b border-gray-200 bg-gray-50/80 backdrop-blur flex items-center justify-between sticky top-0">
        <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Line {selectedLine} History
        </h2>
        {explanation?.source && (
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${explanation.source === 'cache'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
            {explanation.source}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-medium animate-pulse">Resolving blame & PR context...</p>
          </div>
        ) : explanation ? (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 text-xs text-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Commit</span>
                <span className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded text-[11px] border border-gray-200">
                  {context?.commitHash ? context.commitHash.substring(0, 7) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Author</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {context?.author || 'N/A'}
                </span>
              </div>
              {context?.pr ? (
                <div className="pt-3 mt-1 border-t border-gray-100 flex flex-col gap-1.5">
                  <span className="text-gray-500 font-medium">Associated Pull Request</span>
                  <a
                    href={context.pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center gap-1.5 line-clamp-2 leading-relaxed transition-colors"
                  >
                    <GitPullRequest className="w-4 h-4 flex-shrink-0" />
                    #{context.pr.number}: {context.pr.title}
                  </a>
                </div>
              ) : (
                <div className="pt-3 mt-1 border-t border-gray-100 text-amber-600 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Direct commit (no PR linked)
                </div>
              )}
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                Analysis <div className="h-px bg-gray-200 flex-1"></div>
              </span>
              <div className="prose prose-sm text-gray-700 text-[13px] leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    code: ({ children }) => (
                      <code className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-mono text-[11px] border border-rose-100">
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  }}
                >
                  {explanation.explanation}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}