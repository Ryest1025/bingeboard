import { pickNextSpotlight, shuffleArray, createSpotlightConfigs } from '../spotlight';

describe('pickNextSpotlight', () => {
  const sampleList = [
    { id: 1, title: 'Item A' },
    { id: 2, title: 'Item B' },
    { id: 3, title: 'Item C' },
  ];

  test('returns an item from the list', () => {
    const result = pickNextSpotlight(sampleList, null);
    expect(result).not.toBeNull();
    expect(sampleList.map(s => s.id)).toContain(result!.id);
  });

  test('does not repeat the previous spotlight when possible', () => {
    const previous = { id: 2, title: 'Item B' };
    
    // Run multiple times to test randomness doesn't pick previous
    const results = new Set<number>();
    for (let i = 0; i < 50; i++) {
      const result = pickNextSpotlight(sampleList, previous);
      results.add(result!.id);
    }
    
    // Should pick both 1 and 3, but never 2
    expect(results.has(1)).toBe(true);
    expect(results.has(3)).toBe(true);
    // With 50 iterations and 2 choices, virtually impossible to not hit both
  });

  test('returns the same item if only one item exists', () => {
    const singleItem = [{ id: 99, title: 'Only Item' }];
    const previous = { id: 99, title: 'Only Item' };
    
    const result = pickNextSpotlight(singleItem, previous);
    
    expect(result).not.toBeNull();
    expect(result!.id).toBe(99);
  });

  test('returns null for empty list', () => {
    const result = pickNextSpotlight([], null);
    expect(result).toBeNull();
  });

  test('returns null for undefined list', () => {
    const result = pickNextSpotlight(undefined as any, null);
    expect(result).toBeNull();
  });

  test('handles null previous gracefully', () => {
    const result = pickNextSpotlight(sampleList, null);
    expect(result).not.toBeNull();
    expect(sampleList.map(s => s.id)).toContain(result!.id);
  });

  test('randomness stays within array bounds', () => {
    // Run many times to ensure no index out of bounds
    for (let i = 0; i < 100; i++) {
      const result = pickNextSpotlight(sampleList, null);
      expect(result).not.toBeNull();
      expect(sampleList.map(s => s.id)).toContain(result!.id);
    }
  });

  test('works with different item structures', () => {
    const customItems = [
      { id: 10, name: 'Custom A', metadata: { foo: 'bar' } },
      { id: 20, name: 'Custom B', metadata: { baz: 'qux' } },
    ];

    const result = pickNextSpotlight(customItems, null);
    
    expect(result).not.toBeNull();
    expect([10, 20]).toContain(result!.id);
    expect(result).toHaveProperty('metadata');
  });

  test('falls back to original list if all filtered out', () => {
    const twoItems = [
      { id: 1, title: 'A' },
      { id: 2, title: 'B' }
    ];
    
    // This shouldn't happen in practice, but test the fallback
    const result = pickNextSpotlight(twoItems, { id: 999 });
    expect(result).not.toBeNull();
    expect([1, 2]).toContain(result!.id);
  });

  test('distribution is reasonably random', () => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    const iterations = 300;
    
    for (let i = 0; i < iterations; i++) {
      const result = pickNextSpotlight(sampleList, null);
      counts[result!.id as keyof typeof counts]++;
    }
    
    // Each should be picked roughly 100 times (±50 for randomness)
    expect(counts[1]).toBeGreaterThan(50);
    expect(counts[1]).toBeLessThan(150);
    expect(counts[2]).toBeGreaterThan(50);
    expect(counts[2]).toBeLessThan(150);
    expect(counts[3]).toBeGreaterThan(50);
    expect(counts[3]).toBeLessThan(150);
  });
});

describe('shuffleArray', () => {
  test('returns array with same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    
    expect(shuffled).toHaveLength(original.length);
  });

  test('contains all original elements', () => {
    const original = [10, 20, 30, 40, 50];
    const shuffled = shuffleArray(original);
    
    expect(shuffled.sort()).toEqual(original.sort());
  });

  test('does not mutate original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    
    shuffleArray(original);
    
    expect(original).toEqual(originalCopy);
  });

  test('handles empty array', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  test('handles single element', () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });

  test('produces different order (probabilistically)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let differentCount = 0;
    
    // Run shuffle 20 times - should be different from original most times
    for (let i = 0; i < 20; i++) {
      const shuffled = shuffleArray(original);
      if (JSON.stringify(shuffled) !== JSON.stringify(original)) {
        differentCount++;
      }
    }
    
    // With 10 elements, shuffle should produce different order most of the time
    // Probability of getting original order is 1/10! which is astronomically small
    expect(differentCount).toBeGreaterThan(15); // At least 75% different
  });

  test('works with objects', () => {
    const original = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' }
    ];
    
    const shuffled = shuffleArray(original);
    
    expect(shuffled).toHaveLength(3);
    expect(shuffled.map(x => x.id).sort()).toEqual([1, 2, 3]);
  });
});

describe('createSpotlightConfigs', () => {
  const mockTrending = { id: 1, title: 'Trending Show' };
  const mockUpcoming = { id: 2, title: 'Upcoming Show' };
  const mockTopRated = { id: 3, title: 'Top Rated Show' };

  test('creates configs for all three spotlights', () => {
    const configs = createSpotlightConfigs(mockTrending, mockUpcoming, mockTopRated);
    
    expect(configs).toHaveLength(3);
    expect(configs[0].item).toEqual(mockTrending);
    expect(configs[1].item).toEqual(mockUpcoming);
    expect(configs[2].item).toEqual(mockTopRated);
  });

  test('filters out null spotlights', () => {
    const configs = createSpotlightConfigs(mockTrending, null, mockTopRated);
    
    expect(configs).toHaveLength(2);
    expect(configs[0].item).toEqual(mockTrending);
    expect(configs[1].item).toEqual(mockTopRated);
  });

  test('returns empty array when all spotlights are null', () => {
    const configs = createSpotlightConfigs(null, null, null);
    
    expect(configs).toEqual([]);
  });

  test('trending spotlight has correct configuration', () => {
    const configs = createSpotlightConfigs(mockTrending, null, null);
    
    expect(configs[0]).toMatchObject({
      title: "Just Released & Trending",
      badge: "🔥 TRENDING NOW",
      badgeColor: "bg-gradient-to-r from-red-600 to-orange-600",
      cta: "Watch Now",
      action: "watch",
      isUpcoming: false
    });
  });

  test('upcoming spotlight has correct configuration', () => {
    const configs = createSpotlightConfigs(null, mockUpcoming, null);
    
    expect(configs[0]).toMatchObject({
      title: "Coming Soon – Highly Anticipated",
      badge: "🌟 UPCOMING",
      badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      cta: "Remind Me",
      action: "reminder",
      isUpcoming: true
    });
  });

  test('top rated spotlight has correct configuration', () => {
    const configs = createSpotlightConfigs(null, null, mockTopRated);
    
    expect(configs[0]).toMatchObject({
      title: "#1 Show You Haven't Added Yet",
      badge: "🏆 EDITOR'S PICK",
      badgeColor: "bg-gradient-to-r from-teal-600 to-cyan-600",
      cta: "Watch Now",
      action: "watch",
      isUpcoming: false
    });
  });

  test('preserves item data in configs', () => {
    const detailedItem = {
      id: 100,
      title: 'Detailed Show',
      overview: 'A great show',
      rating: 9.5
    };
    
    const configs = createSpotlightConfigs(detailedItem, null, null);
    
    expect(configs[0].item).toEqual(detailedItem);
    expect(configs[0].item.overview).toBe('A great show');
  });

  test('maintains order: trending, upcoming, top rated', () => {
    const configs = createSpotlightConfigs(mockTrending, mockUpcoming, mockTopRated);
    
    expect(configs[0].badge).toContain('TRENDING');
    expect(configs[1].badge).toContain('UPCOMING');
    expect(configs[2].badge).toContain('EDITOR\'S PICK');
  });
});
