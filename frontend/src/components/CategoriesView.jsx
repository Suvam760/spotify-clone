import {
  Globe2,
  Disc3
} from 'lucide-react';
import { BROWSE_CATEGORIES } from '../data/musicData';

const categoryGradients = {
  trending: 'linear-gradient(135deg, #f97316, #ea580c)',
  hindi: 'linear-gradient(135deg, #ec4899, #be185d)',
  english: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  bengali: 'linear-gradient(135deg, #0284c7, #0f766e)',
  punjabi: 'linear-gradient(135deg, #eab308, #ca8a04)',
  tamil: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  telugu: 'linear-gradient(135deg, #06b6d4, #0e7490)',
  bollywood: 'linear-gradient(135deg, #f43f5e, #e11d48)',
  pop: 'linear-gradient(135deg, #d946ef, #a21caf)',
  romantic: 'linear-gradient(135deg, #fb7185, #e11d48)',
  sad: 'linear-gradient(135deg, #64748b, #334155)',
  party: 'linear-gradient(135deg, #f59e0b, #b45309)',
  workout: 'linear-gradient(135deg, #ef4444, #b91c1c)',
  lofi: 'linear-gradient(135deg, #6366f1, #4338ca)',
  hiphop: 'linear-gradient(135deg, #a855f7, #7e22ce)',
  rock: 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
  classical: 'linear-gradient(135deg, #0284c7, #0369a1)',
  instrumental: 'linear-gradient(135deg, #14b8a6, #0f766e)',
  devotional: 'linear-gradient(135deg, #f59e0b, #d97706)',
  newreleases: 'linear-gradient(135deg, #9333ea, #c026d3)'
};

export const CategoriesView = ({ onSelectCategory }) => {
  return (
    <section className="categories-page-view">
      <div className="section-header-row">
        <div>
          <span className="eyebrow"><Globe2 size={14} /> EXPLORE THE WORLD OF SOUND</span>
          <h2 className="section-heading">Languages & Genres</h2>
          <p className="section-subtext">Discover curated channels across regional dialects and global soundscapes.</p>
        </div>
      </div>

      <div className="categories-cards-grid">
        {BROWSE_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="category-big-tile"
            style={{ background: categoryGradients[cat.id] || 'linear-gradient(135deg, #1e293b, #0f172a)' }}
            onClick={() => onSelectCategory(cat.id, cat.label)}
          >
            <div className="category-tile-decor">
              <Disc3 size={64} className="category-bg-disc" />
            </div>
            <h3 className="category-tile-title">{cat.label}</h3>
            <span className="category-tile-chip">Browse Mix</span>
          </div>
        ))}
      </div>
    </section>
  );
};
