import React from 'react';
import { RELATIONSHIP_GROUPS } from '../constants/relationships';

interface RelationshipSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  required?: boolean;
}

export const RelationshipSelect: React.FC<RelationshipSelectProps> = ({
  value,
  onChange,
  id,
  className = '',
  required = false,
}) => {
  return (
    <select
      id={id}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-700/80 bg-neutral-950/80 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer transition-colors ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1em',
        paddingRight: '2.5rem',
      }}
    >
      <option value="" disabled className="bg-neutral-900 text-neutral-400">
        -- Select relationship to John --
      </option>
      {RELATIONSHIP_GROUPS.map((group) => (
        <optgroup
          key={group.group}
          label={group.group}
          className="bg-neutral-900 font-semibold text-purple-400"
        >
          {group.options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-neutral-950 font-normal text-neutral-100 py-1"
            >
              {option}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};
