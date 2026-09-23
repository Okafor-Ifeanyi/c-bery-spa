import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildStructuredData, pendingFields } from './src/seo/structuredData.ts';

/** Writes the JSON-LD into <head>, and names any business fields still missing. */
function structuredData(): Plugin {
  return {
    name: 'c-berry-structured-data',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // `<` is escaped so no string in the data can close the script tag.
          children: JSON.stringify(buildStructuredData()).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ];
    },
    buildEnd() {
      const pending = pendingFields();
      if (pending.length) {
        this.warn(`JSON-LD is missing fields not yet supplied (src/data/business.ts): ${pending.join(', ')}`);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), structuredData()],
});
