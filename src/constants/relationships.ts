export interface RelationshipOptionGroup {
  group: string;
  options: string[];
}

export const RELATIONSHIP_GROUPS: RelationshipOptionGroup[] = [
  {
    group: 'Family Relationships',
    options: [
      'Son',
      'Daughter',
      'Child',
      'Spouse / Partner',
      'Brother',
      'Sister',
      'Sibling',
      'Grandchild',
      'Nephew / Niece',
      'Cousin',
      'Extended Family',
    ],
  },
  {
    group: 'Friends & Acquaintances',
    options: [
      'Close Friend',
      'Friend',
      'Acquaintance',
    ],
  },
  {
    group: 'Other & Unrelated',
    options: [
      'Colleague / Associate',
      'Neighbor / Community Member',
      'Unrelated',
      'Other',
    ],
  },
];

export const ALL_RELATIONSHIPS = RELATIONSHIP_GROUPS.flatMap(g => g.options);

export const FAMILY_RELATIONSHIPS = new Set([
  'Son',
  'Daughter',
  'Child',
  'Spouse / Partner',
  'Brother',
  'Sister',
  'Sibling',
  'Grandchild',
  'Nephew / Niece',
  'Cousin',
  'Extended Family',
]);
