import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);

export default function CodeViewer({ code, onLineClick, selectedLine }) {
  return (
    <div className="text-xs md:text-sm font-mono cursor-pointer w-full overflow-x-auto">
      <SyntaxHighlighter
        language="javascript"
        style={vs2015}
        showLineNumbers={true}
        wrapLines={true}
        customStyle={{ margin: 0, padding: '1rem 0', background: 'transparent' }}
        lineProps={(lineNumber) => {
          const isSelected = lineNumber === selectedLine;
          return {
            onClick: () => onLineClick(lineNumber),
            className: `block px-2 md:px-4 transition-all duration-200 ease-in-out ${isSelected
                ? 'bg-blue-900/40 border-l-4 border-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]'
                : 'border-l-4 border-transparent hover:bg-gray-800/80 hover:border-gray-600'
              }`
          };
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}