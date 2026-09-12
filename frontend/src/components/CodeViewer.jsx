import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);

export default function CodeViewer({ code, onLineClick, selectedLine }) {
  return (
    <div className="text-sm font-mono cursor-pointer">
      <SyntaxHighlighter
        language="javascript"
        style={vs2015}
        showLineNumbers={true}
        wrapLines={true}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
        lineProps={(lineNumber) => {
          const isSelected = lineNumber === selectedLine;
          return {
            onClick: () => onLineClick(lineNumber),
            className: `block hover:bg-gray-800 transition-colors ${isSelected ? 'bg-blue-900/50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`
          };
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}