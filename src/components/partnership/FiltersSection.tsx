import { Filter, Search } from 'lucide-react';
import { FILTER_OPTIONS } from './constants';

interface FiltersSectionProps {
  filter: 'all' | 'pending' | 'approved' | 'rejected';
  setFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function FiltersSection({ filter, setFilter, searchTerm, setSearchTerm }: FiltersSectionProps) {
  return (
    <div className="card">
      <div className="card-content p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              className="form-select w-32"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            >
              {FILTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or school..."
              className="form-input flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}