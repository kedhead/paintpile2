'use client';

import Link from 'next/link';
import { ArrowLeft, Terminal } from 'lucide-react';

export default function ScrapePaintsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Scrape Paint Sets</h1>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
        <h3 className="text-base font-semibold text-amber-500 mb-2">Notice: Scraping Moved to CLI</h3>
        <p className="text-sm text-foreground mb-2">
          The web-based AI scraper has been deprecated due to reliability and hallucination issues. 
          Web scraping process can take several minutes and is prone to triggering timeout errors on Vercel/Cloudflare when run as a web API route.
        </p>
        <p className="text-sm text-foreground">
          We have built a dedicated, highly robust standalone Puppeteer web scraper that runs securely from your server terminal.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="w-5 h-5" /> How to Run the Scraper
        </h3>
        
        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
          <li>Open your terminal and SSH into your server (or open VSCode terminal locally).</li>
          <li>Navigate to the root directory of the PaintPile project.</li>
          <li>Run the following command:</li>
        </ol>

        <div className="bg-black p-4 rounded-md font-mono text-sm text-green-400 mt-4 border border-border">
          pnpm run scrape
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          This script will securely log in to PocketBase, launch an invisible browser to scrape Monument Hobbies, Vallejo, The Army Painter, and AK Interactive, and store all results into your database.
        </p>
      </div>
    </div>
  );
}
