'use client';

export function HydrationFix() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Remove whitespace text nodes from <html>
          const html = document.documentElement;
          for (let i = html.childNodes.length - 1; i >= 0; i--) {
            const node = html.childNodes[i];
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
              html.removeChild(node);
            }
          }
        `,
      }}
    />
  );
}