import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory, categories }) => {
  return (
    <div className="category-list">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          style={{
            whiteSpace: 'nowrap',
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            backgroundColor: selectedCategory === category ? 'var(--primary)' : 'white',
            color: selectedCategory === category ? 'white' : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
            flexShrink: 0 // Crucial para o scroll funcionar
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
