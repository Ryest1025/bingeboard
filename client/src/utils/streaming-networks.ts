export interface StreamingNetwork {
  id: string;
  name: string;
  logo: string;
  color: string;
  category: 'streaming' | 'network' | 'cable';
}

export const STREAMING_NETWORKS: Record<string, StreamingNetwork> = {
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    logo: '🔴',
    color: '#E50914',
    category: 'streaming'
  },
  disney: {
    id: 'disney',
    name: 'Disney+',
    logo: '🏰',
    color: '#113CCF',
    category: 'streaming'
  },
  hbo: {
    id: 'hbo',
    name: 'HBO Max',
    logo: '🎭',
    color: '#7B2CBF',
    category: 'streaming'
  },
  prime: {
    id: 'prime',
    name: 'Prime Video',
    logo: '📦',
    color: '#00A8E1',
    category: 'streaming'
  },
  apple: {
    id: 'apple',
    name: 'Apple TV+',
    logo: '🍎',
    color: '#000000',
    category: 'streaming'
  },
  hulu: {
    id: 'hulu',
    name: 'Hulu',
    logo: '🟢',
    color: '#1CE783',
    category: 'streaming'
  },
  paramount: {
    id: 'paramount',
    name: 'Paramount+',
    logo: '⭐',
    color: '#0065FF',
    category: 'streaming'
  },
  peacock: {
    id: 'peacock',
    name: 'Peacock',
    logo: '🦚',
    color: '#005DAA',
    category: 'streaming'
  },
  showtime: {
    id: 'showtime',
    name: 'Showtime',
    logo: '🎬',
    color: '#FF0000',
    category: 'streaming'
  },
  starz: {
    id: 'starz',
    name: 'Starz',
    logo: '⭐',
    color: '#000000',
    category: 'streaming'
  },
  // Network TV
  abc: {
    id: 'abc',
    name: 'ABC',
    logo: '📺',
    color: '#000000',
    category: 'network'
  },
  cbs: {
    id: 'cbs',
    name: 'CBS',
    logo: '👁️',
    color: '#003366',
    category: 'network'
  },
  nbc: {
    id: 'nbc',
    name: 'NBC',
    logo: '🦚',
    color: '#9C2AA0',
    category: 'network'
  },
  fox: {
    id: 'fox',
    name: 'FOX',
    logo: '🦊',
    color: '#004785',
    category: 'network'
  },
  cw: {
    id: 'cw',
    name: 'The CW',
    logo: '📱',
    color: '#006633',
    category: 'network'
  }
};

export const getStreamingNetwork = (networkName: string): StreamingNetwork | null => {
  const normalized = networkName.toLowerCase().trim();
  
  // Direct matches
  const directMatch = Object.values(STREAMING_NETWORKS).find(
    network => network.name.toLowerCase() === normalized
  );
  if (directMatch) return directMatch;
  
  // Partial matches
  if (normalized.includes('netflix')) return STREAMING_NETWORKS.netflix;
  if (normalized.includes('disney')) return STREAMING_NETWORKS.disney;
  if (normalized.includes('hbo') || normalized.includes('max')) return STREAMING_NETWORKS.hbo;
  if (normalized.includes('prime') || normalized.includes('amazon')) return STREAMING_NETWORKS.prime;
  if (normalized.includes('apple')) return STREAMING_NETWORKS.apple;
  if (normalized.includes('hulu')) return STREAMING_NETWORKS.hulu;
  if (normalized.includes('paramount')) return STREAMING_NETWORKS.paramount;
  if (normalized.includes('peacock')) return STREAMING_NETWORKS.peacock;
  if (normalized.includes('showtime')) return STREAMING_NETWORKS.showtime;
  if (normalized.includes('starz')) return STREAMING_NETWORKS.starz;
  if (normalized.includes('abc')) return STREAMING_NETWORKS.abc;
  if (normalized.includes('cbs')) return STREAMING_NETWORKS.cbs;
  if (normalized.includes('nbc')) return STREAMING_NETWORKS.nbc;
  if (normalized.includes('fox')) return STREAMING_NETWORKS.fox;
  if (normalized.includes('cw')) return STREAMING_NETWORKS.cw;
  
  return null;
};

export const getNetworksByCategory = (category: 'streaming' | 'network' | 'cable') => {
  return Object.values(STREAMING_NETWORKS).filter(network => network.category === category);
};

export const getAllNetworks = () => {
  return Object.values(STREAMING_NETWORKS);
};