import type {
  CollectionResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddModToCollectionRequest,
  RemoveModFromCollectionRequest,
  ServerStatusResponse,
  ServerMetricsResponse,
  ServerActionRequest,
  ServerConfigResponse,
  UpdateServerConfigRequest,
  ModHelper,
  ModSubscription,
  UpdateModSubscriptionRequest,
  ModDownloadResponse,
  AsyncJobStatusResponse,
  AsyncJobSuccessResponse,
} from '@/types/api';

// Environment flag to enable/disable mock data
export const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  import.meta.env.MODE === 'development';

// Mock data - Comprehensive ARMA 3 mod collections
const mockCollections: CollectionResponse[] = [
  {
    id: 1,
    name: 'Essential Framework',
    description: 'Core mods required for most ARMA 3 modded gameplay',
    mods: [
      {
        id: 1,
        name: 'CBA_A3',
        version: '3.17.0.231121',
        size: '48.7 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 2,
        name: '@ACE3',
        version: '3.16.1.231215',
        size: '1.31 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: true,
        disabled: false,
      },
      {
        id: 3,
        name: '@ALiVE',
        version: '2.1.9.2501091',
        size: '484.3 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2024-01-15',
    isActive: true,
  },
  {
    id: 2,
    name: 'RHS Complete',
    description: 'Red Hammer Studios - High quality modern military equipment',
    mods: [
      {
        id: 4,
        name: 'RHS AFRF',
        version: '0.5.6.231205',
        size: '3.2 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 5,
        name: 'RHS USAF',
        version: '0.5.6.231205',
        size: '3.4 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 6,
        name: 'RHS GREF',
        version: '0.5.6.231205',
        size: '1.8 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 7,
        name: 'RHS SAF',
        version: '0.5.6.231205',
        size: '892.4 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2024-01-12',
    isActive: false,
  },
  {
    id: 3,
    name: 'CUP Complete',
    description: 'Community Upgrade Project - Legacy ARMA 2 content ported to ARMA 3',
    mods: [
      {
        id: 8,
        name: 'CUP Terrains - Core',
        version: '1.17.0.231120',
        size: '2.1 GB',
        type: 'map',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 9,
        name: 'CUP Terrains - Maps 2.0',
        version: '1.17.0.231120',
        size: '1.3 GB',
        type: 'map',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 10,
        name: 'CUP Weapons',
        version: '1.17.0.231120',
        size: '967.8 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: true,
        disabled: false,
      },
      {
        id: 11,
        name: 'CUP Vehicles',
        version: '1.17.0.231120',
        size: '1.4 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 12,
        name: 'CUP Units',
        version: '1.17.0.231120',
        size: '743.2 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2024-01-10',
    isActive: false,
  },
  {
    id: 4,
    name: 'Special Operations',
    description: 'Elite units and tactical equipment for special forces gameplay',
    mods: [
      {
        id: 13,
        name: 'Tier One Weapons',
        version: '1.2.6.07',
        size: '3.12 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 14,
        name: '3CB BAF Weapons',
        version: '5.1.3.231201',
        size: '456.7 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 15,
        name: '3CB BAF Equipment',
        version: '5.1.3.231201',
        size: '234.1 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 16,
        name: '3CB BAF Units',
        version: '5.1.3.231201',
        size: '298.3 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 17,
        name: '3CB BAF Vehicles',
        version: '5.1.3.231201',
        size: '567.9 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: true,
        disabled: false,
      },
    ],
    createdAt: '2024-01-08',
    isActive: false,
  },
  {
    id: 5,
    name: 'Immersion & Audio',
    description: 'Enhanced sounds, visuals, and immersive gameplay features',
    mods: [
      {
        id: 18,
        name: 'JSRS SOUNDMOD 2025 Beta',
        version: 'RC3.240711',
        size: '947.7 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 19,
        name: 'Enhanced Movement',
        version: '1.1.1.230915',
        size: '12.4 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 20,
        name: 'Advanced Vault System',
        version: '1.5.240322',
        size: '8.2 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 21,
        name: 'Immerse',
        version: '1.47.231018',
        size: '89.3 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 22,
        name: 'D.I.R.T. - Dynamic Textures',
        version: '1.2.240724',
        size: '24.2 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: true,
        disabled: false,
      },
    ],
    createdAt: '2024-01-05',
    isActive: false,
  },
  {
    id: 6,
    name: 'Custom Terrains',
    description: 'High quality custom maps and terrains',
    mods: [
      {
        id: 23,
        name: 'Lythium',
        version: '1.1.231025',
        size: '2.8 GB',
        type: 'map',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 24,
        name: "Sa'hatra",
        version: '1.3.240215',
        size: '1.9 GB',
        type: 'map',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 25,
        name: 'Korsac',
        version: '2.1.231127',
        size: '3.4 GB',
        type: 'map',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 26,
        name: 'Šumava',
        version: '1.0.240612',
        size: '2.7 GB',
        type: 'map',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2024-01-03',
    isActive: false,
  },
  {
    id: 7,
    name: 'Modern Factions',
    description: 'Contemporary military forces and modern warfare units',
    mods: [
      {
        id: 27,
        name: 'Project OPFOR',
        version: '5.2.231210',
        size: '1.1 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 28,
        name: 'Community Factions Project',
        version: '0.5.1.231119',
        size: '2.3 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: true,
        disabled: false,
      },
      {
        id: 29,
        name: '2035: Russian Armed Forces',
        version: '2.1.240318',
        size: '789.5 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 30,
        name: 'USAF Mod - Main',
        version: '8.6.231201',
        size: '1.8 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2023-12-28',
    isActive: false,
  },
  {
    id: 8,
    name: 'AI Enhancement',
    description: 'Improved AI behavior and tactical gameplay',
    mods: [
      {
        id: 31,
        name: 'LAMBS_Danger.fsm',
        version: '2.5.4.231015',
        size: '67.8 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 32,
        name: 'LAMBS_RPG',
        version: '1.3.2.230918',
        size: '12.1 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 33,
        name: 'LAMBS_Suppression',
        version: '1.2.1.230812',
        size: '8.4 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 34,
        name: 'LAMBS_Turrets',
        version: '1.1.0.230715',
        size: '6.2 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2023-12-20',
    isActive: false,
  },
  {
    id: 9,
    name: 'Weapon Systems',
    description: 'Additional weapons and weapon systems',
    mods: [
      {
        id: 35,
        name: 'NIArms All In One',
        version: '14.2.231105',
        size: '2.1 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 36,
        name: 'RKSL Studios - Attachments',
        version: '3.02c.231028',
        size: '89.7 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 37,
        name: 'Advanced Weapon Mounting',
        version: '1.1.5.231009',
        size: '34.6 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2023-12-15',
    isActive: false,
  },
  {
    id: 10,
    name: 'Quality of Life',
    description: 'Gameplay improvements and quality of life enhancements',
    mods: [
      {
        id: 38,
        name: 'Task Force Arrowhead Radio',
        version: '1.0.383.240215',
        size: '156.3 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: true,
      },
      {
        id: 39,
        name: 'Zeus Enhanced',
        version: '1.13.2.231201',
        size: '78.9 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 40,
        name: 'Zeus Enhanced - ACE3 Compat',
        version: '1.5.1.231015',
        size: '23.4 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 41,
        name: 'Better Inventory',
        version: '1.4.2.230820',
        size: '15.7 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 42,
        name: 'Tactical Position Ready',
        version: '2.1.231118',
        size: '19.8 MB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2023-12-10',
    isActive: false,
  },
  {
    id: 11,
    name: 'WW2 Collection',
    description: 'World War 2 units, weapons, and vehicles',
    mods: [
      {
        id: 43,
        name: 'Faces of War',
        version: '2.2.4.231127',
        size: '4.8 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 44,
        name: 'Iron Front Liberation 1944',
        version: '1.7.2.231015',
        size: '6.2 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 45,
        name: 'CSA38 - Czechoslovak Army',
        version: '3.1.231201',
        size: '1.9 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2023-12-05',
    isActive: false,
  },
  {
    id: 12,
    name: 'Cold War',
    description: 'Cold War era equipment and factions',
    mods: [
      {
        id: 46,
        name: 'Cold War Rearmed III',
        version: '0.9.8.231110',
        size: '3.7 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
      {
        id: 47,
        name: 'Cold War Factions',
        version: '1.4.2.231025',
        size: '2.1 GB',
        type: 'mod',
        isServerMod: false,
        hasUpdate: false,
        disabled: false,
      },
    ],
    createdAt: '2023-11-28',
    isActive: false,
  },
];

const mockServerStatus: ServerStatusResponse = {
  id: 1,
  name: 'My ARMA 3 Server',
  status: 'online',
  uptime: 234567,
  players: 12,
  maxPlayers: 64,
  mission: 'Lythium Patrol Ops',
  lastRestart: '2 days ago',
  cpu: 26,
  memory: 30,
  mods: 47,
  version: '2.18.151618',
  activeCollection: {
    id: 1,
    name: 'Essential Framework',
  },
};

const mockServerConfig: ServerConfigResponse = {
  id: 1,
  name: 'My ARMA 3 Server',
  port: 2302,
  maxPlayers: 64,
  password: '',
  adminPassword: 'admin123',
  serverPassword: '',
  mission: 'Lythium Patrol Ops',
  difficulty: 'Veteran',
  timeLimit: 0,
  autoRestart: true,
  autoRestartTime: 6,
  mods: [
    'CBA_A3',
    '@ACE3',
    '@ALiVE',
    'RHS AFRF',
    'RHS USAF',
    'RHS GREF',
    'Task Force Arrowhead Radio',
    'LAMBS_Danger.fsm',
    'Enhanced Movement',
    'Lythium',
  ],
  customParams: [
    '-profiles=./profiles',
    '-config=./config.cfg',
    '-world=Lythium',
    '-mod=@CBA_A3;@ace;@alive;@rhs_afrf;@rhs_usaf;@rhs_gref;@task_force_radio;@lambs_danger;@enhanced_movement;@lythium',
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z',
};

// Generate mock metrics history
const generateMockMetrics = (): ServerMetricsResponse[] => {
  const now = Date.now();
  const data: ServerMetricsResponse[] = [];

  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000; // hourly data for 24 hours
    const baseLoad = Math.sin(((24 - i) / 24) * Math.PI * 2) * 20 + 50; // simulate daily pattern

    data.push({
      timestamp,
      players: Math.max(0, Math.floor(baseLoad / 3 + Math.random() * 10)),
      cpu: Math.max(10, Math.min(90, baseLoad + Math.random() * 20 - 10)),
      memory: Math.max(20, Math.min(85, baseLoad * 0.8 + Math.random() * 15 - 7.5)),
    });
  }

  return data;
};

const mockServerMetrics = generateMockMetrics();

// Comprehensive mod subscriptions list based on collections data
const mockModSubscriptions: ModSubscription[] = [
  // Essential Framework mods
  {
    steam_id: 450814997,
    name: 'CBA_A3',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-15T10:30:00Z',
  },
  {
    steam_id: 463939057,
    name: '@ACE3',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-15T11:45:00Z',
  },
  {
    steam_id: 620260972,
    name: '@ALiVE',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-15T09:15:00Z',
  },

  // RHS mods
  {
    steam_id: 843425103,
    name: 'RHS AFRF',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-12T14:20:00Z',
  },
  {
    steam_id: 843577117,
    name: 'RHS USAF',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-12T14:25:00Z',
  },
  {
    steam_id: 843593391,
    name: 'RHS GREF',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-12T14:30:00Z',
  },
  {
    steam_id: 843632231,
    name: 'RHS SAF',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-12T14:35:00Z',
  },

  // CUP mods
  {
    steam_id: 583496184,
    name: 'CUP Terrains - Core',
    type: 'map',
    status: 'active',
    last_updated: '2024-01-10T16:00:00Z',
  },
  {
    steam_id: 1981964169,
    name: 'CUP Terrains - Maps 2.0',
    type: 'map',
    status: 'active',
    last_updated: '2024-01-10T16:05:00Z',
  },
  {
    steam_id: 497660133,
    name: 'CUP Weapons',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-10T16:10:00Z',
  },
  {
    steam_id: 541888371,
    name: 'CUP Vehicles',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-10T16:15:00Z',
  },
  {
    steam_id: 497661914,
    name: 'CUP Units',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-10T16:20:00Z',
  },

  // Special Operations mods
  {
    steam_id: 2268169306,
    name: 'Tier One Weapons',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-08T12:00:00Z',
  },
  {
    steam_id: 893339590,
    name: '3CB BAF Weapons',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-08T12:10:00Z',
  },
  {
    steam_id: 893349825,
    name: '3CB BAF Equipment',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-08T12:15:00Z',
  },
  {
    steam_id: 893328083,
    name: '3CB BAF Units',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-08T12:20:00Z',
  },
  {
    steam_id: 893346105,
    name: '3CB BAF Vehicles',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-08T12:25:00Z',
  },

  // Immersion & Audio mods
  {
    steam_id: 2260572637,
    name: 'JSRS SOUNDMOD 2025 Beta',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-05T18:00:00Z',
  },
  {
    steam_id: 333310405,
    name: 'Enhanced Movement',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-05T18:10:00Z',
  },
  {
    steam_id: 1661066023,
    name: 'Advanced Vault System',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-05T18:15:00Z',
  },
  {
    steam_id: 825172265,
    name: 'Immerse',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-05T18:20:00Z',
  },
  {
    steam_id: 2938962102,
    name: 'D.I.R.T. - Dynamic Textures',
    type: 'mod',
    status: 'active',
    last_updated: '2024-01-05T18:25:00Z',
  },

  // Custom Terrains (Maps)
  {
    steam_id: 909547724,
    name: 'Lythium',
    type: 'map',
    status: 'active',
    last_updated: '2024-01-03T20:00:00Z',
  },
  {
    steam_id: 1643266453,
    name: "Sa'hatra",
    type: 'map',
    status: 'active',
    last_updated: '2024-01-03T20:10:00Z',
  },
  {
    steam_id: 1379630828,
    name: 'Korsac',
    type: 'map',
    status: 'active',
    last_updated: '2024-01-03T20:20:00Z',
  },
  {
    steam_id: 2902174634,
    name: 'Šumava',
    type: 'map',
    status: 'active',
    last_updated: '2024-01-03T20:30:00Z',
  },

  // Modern Factions
  {
    steam_id: 735566597,
    name: 'Project OPFOR',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-28T15:00:00Z',
  },
  {
    steam_id: 1369691841,
    name: 'Community Factions Project',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-28T15:10:00Z',
  },
  {
    steam_id: 2037691208,
    name: '2035: Russian Armed Forces',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-28T15:20:00Z',
  },
  {
    steam_id: 531769986,
    name: 'USAF Mod - Main',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-28T15:30:00Z',
  },

  // AI Enhancement
  {
    steam_id: 1858075458,
    name: 'LAMBS_Danger.fsm',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-20T13:00:00Z',
  },
  {
    steam_id: 1858070328,
    name: 'LAMBS_RPG',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-20T13:10:00Z',
  },
  {
    steam_id: 1808238502,
    name: 'LAMBS_Suppression',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-20T13:15:00Z',
  },
  {
    steam_id: 1862208264,
    name: 'LAMBS_Turrets',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-20T13:20:00Z',
  },

  // Weapon Systems
  {
    steam_id: 2595680138,
    name: 'NIArms All In One',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-15T11:00:00Z',
  },
  {
    steam_id: 1661337345,
    name: 'RKSL Studios - Attachments',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-15T11:10:00Z',
  },
  {
    steam_id: 2671637090,
    name: 'Advanced Weapon Mounting',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-15T11:20:00Z',
  },

  // Quality of Life
  {
    steam_id: 894678801,
    name: 'Task Force Arrowhead Radio',
    type: 'mod',
    status: 'disabled',
    last_updated: '2023-12-10T17:00:00Z',
  },
  {
    steam_id: 1779063631,
    name: 'Zeus Enhanced',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-10T17:10:00Z',
  },
  {
    steam_id: 2018593688,
    name: 'Zeus Enhanced - ACE3 Compat',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-10T17:15:00Z',
  },
  {
    steam_id: 1673456286,
    name: 'Better Inventory',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-10T17:20:00Z',
  },
  {
    steam_id: 1889104848,
    name: 'Tactical Position Ready',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-10T17:25:00Z',
  },

  // WW2 Collection
  {
    steam_id: 2423653994,
    name: 'Faces of War',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-05T19:00:00Z',
  },
  {
    steam_id: 660460283,
    name: 'Iron Front Liberation 1944',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-05T19:10:00Z',
  },
  {
    steam_id: 1294225529,
    name: 'CSA38 - Czechoslovak Army',
    type: 'mod',
    status: 'active',
    last_updated: '2023-12-05T19:20:00Z',
  },

  // Cold War
  {
    steam_id: 1978754337,
    name: 'Cold War Rearmed III',
    type: 'mod',
    status: 'active',
    last_updated: '2023-11-28T21:00:00Z',
  },
  {
    steam_id: 1879737195,
    name: 'Cold War Factions',
    type: 'mod',
    status: 'active',
    last_updated: '2023-11-28T21:10:00Z',
  },

  // Missions
  {
    steam_id: 3001234567,
    name: 'Antistasi - Altis',
    type: 'mission',
    status: 'active',
    last_updated: '2024-01-20T14:00:00Z',
  },
  {
    steam_id: 3001234568,
    name: 'Liberation - Tanoa',
    type: 'mission',
    status: 'active',
    last_updated: '2024-01-18T16:30:00Z',
  },
  {
    steam_id: 3001234569,
    name: 'DUWS - Dynamic Universal War System',
    type: 'mission',
    status: 'active',
    last_updated: '2024-01-16T11:15:00Z',
  },
  {
    steam_id: 3001234570,
    name: 'Warlords - Official',
    type: 'mission',
    status: 'active',
    last_updated: '2024-01-14T09:45:00Z',
  },
  {
    steam_id: 3001234571,
    name: 'King of the Hill',
    type: 'mission',
    status: 'disabled',
    last_updated: '2024-01-12T13:20:00Z',
  },
];

// Simulate API delay for realistic testing
const simulateNetworkDelay = (min: number = 50, max: number = 100): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Mock Collections Service
export const mockCollectionsService = {
  getCollections: async (): Promise<CollectionResponse[]> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Fetching collections');
    return [...mockCollections];
  },

  getCollection: async (collectionId: number): Promise<CollectionResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Fetching collection ${collectionId}`);
    const collection = mockCollections.find((c) => c.id === collectionId);
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }
    return { ...collection };
  },

  createCollection: async (
    collectionData: CreateCollectionRequest
  ): Promise<CollectionResponse> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Creating collection', collectionData);

    const newCollection: CollectionResponse = {
      id: Math.max(...mockCollections.map((c) => c.id)) + 1,
      name: collectionData.name,
      description: collectionData.description,
      mods: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: false,
    };

    mockCollections.push(newCollection);
    return { ...newCollection };
  },

  updateCollection: async (
    collectionId: number,
    updateData: UpdateCollectionRequest
  ): Promise<CollectionResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Updating collection ${collectionId}`, updateData);

    const collectionIndex = mockCollections.findIndex((c) => c.id === collectionId);
    if (collectionIndex === -1) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    // If setting active, make others inactive
    if (updateData.isActive) {
      mockCollections.forEach((c) => {
        c.isActive = false;
      });
    }

    mockCollections[collectionIndex] = {
      ...mockCollections[collectionIndex],
      ...updateData,
    };

    return { ...mockCollections[collectionIndex] };
  },

  deleteCollection: async (collectionId: number): Promise<{ message: string }> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Deleting collection ${collectionId}`);

    const collectionIndex = mockCollections.findIndex((c) => c.id === collectionId);
    if (collectionIndex === -1) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    mockCollections.splice(collectionIndex, 1);
    return { message: 'Collection deleted successfully' };
  },

  addModsToCollection: async (
    collectionId: number,
    modData: AddModToCollectionRequest
  ): Promise<CollectionResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Adding mods to collection ${collectionId}`, modData);

    // This would typically fetch the mods and add them to the collection
    // For now, just return the existing collection
    return mockCollectionsService.getCollection(collectionId);
  },

  removeModFromCollection: async (
    collectionId: number,
    modData: RemoveModFromCollectionRequest
  ): Promise<CollectionResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Removing mod from collection ${collectionId}`, modData);

    const collectionIndex = mockCollections.findIndex((c) => c.id === collectionId);
    if (collectionIndex === -1) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    mockCollections[collectionIndex].mods = mockCollections[
      collectionIndex
    ].mods.filter((mod) => mod.id !== modData.modId);

    return { ...mockCollections[collectionIndex] };
  },

  toggleModInCollection: async (
    collectionId: number,
    modId: number,
    disabled: boolean
  ): Promise<CollectionResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Toggling mod ${modId} in collection ${collectionId}`, {
      disabled,
    });

    const collectionIndex = mockCollections.findIndex((c) => c.id === collectionId);
    if (collectionIndex === -1) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    const modIndex = mockCollections[collectionIndex].mods.findIndex(
      (m) => m.id === modId
    );
    if (modIndex === -1) {
      throw new Error(`Mod with id ${modId} not found in collection`);
    }

    mockCollections[collectionIndex].mods[modIndex].disabled = disabled;

    return { ...mockCollections[collectionIndex] };
  },
};

// Mock Server Service
export const mockServerService = {
  getServerStatus: async (): Promise<ServerStatusResponse> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Fetching server status');
    return { ...mockServerStatus };
  },

  getServerMetrics: async (): Promise<ServerMetricsResponse[]> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Fetching server metrics');
    return [...mockServerMetrics];
  },

  performServerAction: async (
    actionData: ServerActionRequest
  ): Promise<{ message: string; status: string }> => {
    await simulateNetworkDelay(1000, 3000); // Longer delay for server actions
    console.log('🎭 Mock API: Performing server action', actionData);

    // Simulate server state changes
    if (actionData.action === 'start') {
      mockServerStatus.status = 'starting';
      if (actionData.collectionId) {
        const collection = mockCollections.find(
          (c) => c.id === actionData.collectionId
        );
        mockServerStatus.activeCollection = collection
          ? {
              id: collection.id,
              name: collection.name,
            }
          : undefined;
      }
      // Simulate server coming online after a delay
      setTimeout(() => {
        mockServerStatus.status = 'online';
        mockServerStatus.players = 0;
        mockServerStatus.cpu = 15;
        mockServerStatus.memory = 25;
      }, 5000);
    } else if (actionData.action === 'stop') {
      mockServerStatus.status = 'stopping';
      // Simulate server going offline after a delay
      setTimeout(() => {
        mockServerStatus.status = 'offline';
        mockServerStatus.players = 0;
        mockServerStatus.cpu = 0;
        mockServerStatus.memory = 0;
        mockServerStatus.activeCollection = undefined;
      }, 3000);
    } else if (actionData.action === 'restart') {
      mockServerStatus.status = 'stopping';
      // Simulate restart sequence
      setTimeout(() => {
        mockServerStatus.status = 'starting';
        mockServerStatus.players = 0;
        mockServerStatus.cpu = 0;
        mockServerStatus.memory = 0;
        setTimeout(() => {
          mockServerStatus.status = 'online';
          mockServerStatus.players = 0;
          mockServerStatus.cpu = 15;
          mockServerStatus.memory = 25;
        }, 3000);
      }, 2000);
    }

    return {
      message: `Server ${actionData.action} initiated successfully`,
      status: 'success',
    };
  },

  getServerConfig: async (): Promise<ServerConfigResponse> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Fetching server config');
    return { ...mockServerConfig };
  },

  updateServerConfig: async (
    configData: UpdateServerConfigRequest
  ): Promise<ServerConfigResponse> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Updating server config', configData);

    Object.assign(mockServerConfig, configData, {
      updatedAt: new Date().toISOString(),
    });

    return { ...mockServerConfig };
  },
};

// Mock Mod Service
export const mockModService = {
  getModHelper: async (modId: number): Promise<ModHelper> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Fetching mod helper ${modId}`);
    return {
      description: 'This is a mock mod for testing purposes',
      file_size: '500 MB',
      preview_url: 'https://example.com/mock-preview.jpg',
      tags: ['mock', 'test', 'arma3'],
      time_updated: new Date().toISOString(),
      title: `Mock Mod ${modId}`,
    };
  },

  getModSubscriptions: async (): Promise<ModSubscription[]> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Fetching mod subscriptions');
    return mockModSubscriptions;
  },

  addModSubscriptions: async (
    mods: Array<{ steam_id: number }>
  ): Promise<{ message: string }> => {
    await simulateNetworkDelay();
    console.log('🎭 Mock API: Adding mod subscriptions', mods);
    return { message: 'Mod subscriptions added successfully' };
  },

  getModSubscriptionDetails: async (modId: number): Promise<ModSubscription> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Fetching mod subscription details ${modId}`);
    return {
      steam_id: modId,
      name: `Mock Mod ${modId}`,
      status: 'active',
      last_updated: new Date().toISOString(),
    };
  },

  updateModSubscription: async (
    modId: number,
    updateData: UpdateModSubscriptionRequest
  ): Promise<{ message: string }> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Updating mod subscription ${modId}`, updateData);
    return { message: 'Mod subscription updated successfully' };
  },

  removeModSubscription: async (modId: number): Promise<{ message: string }> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Removing mod subscription ${modId}`);
    return { message: 'Mod subscription removed successfully' };
  },

  getModSubscriptionImage: async (modId: number): Promise<Blob> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Fetching mod subscription image ${modId}`);
    // Return a mock image blob
    return new Blob(['mock image data'], { type: 'image/png' });
  },

  downloadMod: async (modId: number): Promise<ModDownloadResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Downloading mod ${modId}`);
    return {
      status: `mock-job-${modId}-${Date.now()}`,
      message: 'Download job created successfully',
    };
  },

  deleteMod: async (modId: number): Promise<ModDownloadResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Deleting mod ${modId}`);
    return {
      status: `mock-delete-job-${modId}-${Date.now()}`,
      message: 'Delete job created successfully',
    };
  },

  getAsyncJobStatus: async (
    jobId: string
  ): Promise<AsyncJobStatusResponse | AsyncJobSuccessResponse> => {
    await simulateNetworkDelay();
    console.log(`🎭 Mock API: Checking job status ${jobId}`);
    return {
      status: 'completed',
      message: 'Job completed successfully',
    };
  },
};
