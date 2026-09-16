import React from 'react';

/**
 * PoppingText Component
 * Animates each newly streamed character with a lively, bouncy pop animation.
 * Uses persistent character-index keys so existing characters never re-animate,
 * and wraps words in nowrap containers to ensure natural word-wrapping.
 */
export const PoppingText = React.memo(function PoppingText({ text, isAnimated = true }) {
  if (!text) return null;

  if (!isAnimated) {
    return <span className="emmu-static-text">{text}</span>;
  }

  const lines = text.split('\n');
  let globalCharIndex = 0;

  return (
    <span className="emmu-popping-content">
      {lines.map((line, lineIndex) => {
        // Split line into tokens: words or whitespace runs
        const tokens = line.match(/\S+|\s+/g) || (line === '' ? [''] : [line]);

        const lineContent = tokens.map((token, tokenIndex) => {
          // Whitespace sequence (spaces, tabs)
          if (/^\s+$/.test(token)) {
            const spaceChars = Array.from(token).map((ch) => {
              const charKey = globalCharIndex++;
              return (
                <span key={`sc-${charKey}`} className="emmu-pop-space">
                  {ch}
                </span>
              );
            });
            return (
              <span key={`spg-${tokenIndex}`} className="emmu-pop-space-group">
                {spaceChars}
              </span>
            );
          }

          // Word sequence
          const chars = Array.from(token);
          return (
            <span key={`wrd-${tokenIndex}`} className="emmu-pop-word">
              {chars.map((char) => {
                const charKey = globalCharIndex++;
                return (
                  <span key={`pc-${charKey}`} className="emmu-pop-char">
                    {char}
                  </span>
                );
              })}
            </span>
          );
        });

        // Account for \n in character index between lines
        if (lineIndex < lines.length - 1) {
          globalCharIndex++;
        }

        return (
          <React.Fragment key={`ln-${lineIndex}`}>
            {lineContent}
            {lineIndex < lines.length - 1 && <br className="emmu-line-break" />}
          </React.Fragment>
        );
      })}
    </span>
  );
});

export default PoppingText;
