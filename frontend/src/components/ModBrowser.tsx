import { useState } from 'react';
import {
  IconDownload,
  IconSearch,
  IconStar,
  IconCalendar,
  IconUser,
  IconTag,
  IconRefresh,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkshopMod {
  id: number;
  steamId: number;
  name: string;
  author: string;
  description: string;
  imageUrl?: string;
  rating: number;
  subscribers: number;
  lastUpdated: string;
  size: string;
  tags: string[];
  type: 'mod' | 'mission' | 'map';
  isInstalled: boolean;
  hasUpdate: boolean;
}

export function ModBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const [mods] = useState<WorkshopMod[]>([
    {
      id: 1,
      steamId: 843577117,
      name: '@ACE3',
      author: 'ACE3 Team',
      description:
        'Advanced Combat Environment 3 - A comprehensive mod that enhances the realism and authenticity of Arma 3.',
      imageUrl: '/mod-images/ace3.jpg',
      rating: 4.8,
      subscribers: 2450000,
      lastUpdated: '2024-01-15',
      size: '1.2 GB',
      tags: ['Realism', 'Medical', 'Ballistics'],
      type: 'mod',
      isInstalled: true,
      hasUpdate: false,
    },
    {
      id: 2,
      steamId: 450814997,
      name: 'CBA_A3',
      author: 'CBA Team',
      description:
        'Community Base Addons A3 - Provides a common framework for Arma 3 mods.',
      imageUrl: '/mod-images/cba.jpg',
      rating: 4.9,
      subscribers: 3200000,
      lastUpdated: '2024-01-20',
      size: '45 MB',
      tags: ['Framework', 'Dependency'],
      type: 'mod',
      isInstalled: true,
      hasUpdate: true,
    },
    {
      id: 3,
      steamId: 1673456286,
      name: 'RHS: Armed Forces of the Russian Federation',
      author: 'Red Hammer Studios',
      description: 'Adds Russian military units, vehicles, and equipment to Arma 3.',
      imageUrl: '/mod-images/rhs-afrf.jpg',
      rating: 4.7,
      subscribers: 1800000,
      lastUpdated: '2024-01-10',
      size: '2.8 GB',
      tags: ['Vehicles', 'Weapons', 'Units'],
      type: 'mod',
      isInstalled: false,
      hasUpdate: false,
    },
    {
      id: 4,
      steamId: 1858075458,
      name: 'Altis Life Framework',
      author: 'Altis Life Community',
      description:
        'Complete framework for creating Altis Life servers with economy and roleplay features.',
      type: 'mission',
      rating: 4.2,
      subscribers: 650000,
      lastUpdated: '2024-01-18',
      size: '156 MB',
      tags: ['Roleplay', 'Economy', 'Framework'],
      isInstalled: false,
      hasUpdate: false,
    },
  ]);

  const handleDownload = async (_modId: number) => {
    setIsLoading(true);
    // Simulate download process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const filteredMods = mods.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || mod.type === filterType;

    return matchesSearch && matchesType;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Steam Workshop Browser</h2>
        <Button variant="outline">
          <IconRefresh className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search mods, authors, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mod">Mods</SelectItem>
            <SelectItem value="mission">Missions</SelectItem>
            <SelectItem value="map">Maps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMods.map((mod) => (
          <Card key={mod.id} className="flex flex-col">
            <div className="relative">
              {mod.imageUrl ? (
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Mod Preview</span>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No Preview</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {mod.type}
                </Badge>
                {mod.hasUpdate && (
                  <Badge variant="destructive" className="text-xs">
                    Update
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">{mod.name}</CardTitle>
                <div className="flex items-center gap-1 text-yellow-500">
                  <IconStar className="size-4 fill-current" />
                  <span className="text-sm">{mod.rating}</span>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2 text-sm">
                <IconUser className="size-3" />
                {mod.author}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {mod.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {mod.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <IconTag className="size-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IconDownload className="size-3" />
                  {formatNumber(mod.subscribers)}
                </div>
                <div className="flex items-center gap-1">
                  <IconCalendar className="size-3" />
                  {new Date(mod.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">Size: {mod.size}</div>
            </CardContent>

            <CardFooter className="pt-2">
              {mod.isInstalled ? (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" disabled>
                    Installed
                  </Button>
                  {mod.hasUpdate && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(mod.id)}
                      disabled={isLoading}
                    >
                      Update
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleDownload(mod.id)}
                  disabled={isLoading}
                >
                  <IconDownload className="size-4 mr-2" />
                  {isLoading ? 'Downloading...' : 'Download'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredMods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No mods found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
