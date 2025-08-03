import { useState } from 'react';
import {
    IconTrash,
    IconRefresh,
    IconSearch,
    IconUser,
    IconPuzzle,
    IconFlag,
    IconMap,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
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
import { PageTitle } from '@/components/common/PageTitle';

interface InstalledMod {
    id: number;
    steamId: number;
    name: string;
    author: string;
    lastUpdated: string;
    type: 'mod' | 'mission' | 'map';
    hasUpdate: boolean;
    sizeOnDisk?: string;
}

export function InstalledModsManager() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);

    const [mods] = useState<InstalledMod[]>([
        {
            id: 1,
            steamId: 843577117,
            name: '@ACE3',
            author: 'ACE3 Team',
            lastUpdated: '2024-01-15',
            type: 'mod',
            hasUpdate: false,
            sizeOnDisk: '245 MB',
        },
        {
            id: 2,
            steamId: 450814997,
            name: 'CBA_A3',
            author: 'CBA Team',
            lastUpdated: '2024-01-20',
            type: 'mod',
            hasUpdate: true,
            sizeOnDisk: '15 MB',
        },
        {
            id: 3,
            steamId: 1673456286,
            name: 'RHS: Armed Forces of the Russian Federation',
            author: 'Red Hammer Studios',
            lastUpdated: '2024-01-10',
            type: 'mod',
            hasUpdate: false,
            sizeOnDisk: '1.2 GB',
        },
        {
            id: 4,
            steamId: 1858075458,
            name: 'Altis Life Framework',
            author: 'Altis Life Community',
            lastUpdated: '2024-01-18',
            type: 'mission',
            hasUpdate: false,
            sizeOnDisk: '85 MB',
        },
    ]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'mod':
                return <IconPuzzle className="size-3 text-muted-foreground" />;
            case 'mission':
                return <IconFlag className="size-3 text-muted-foreground" />;
            case 'map':
                return <IconMap className="size-3 text-muted-foreground" />;
            default:
                return <IconPuzzle className="size-3 text-muted-foreground" />;
        }
    };

    const handleUpdate = async (_modId: number) => {
        setIsLoading(true);
        // Simulate update process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsLoading(false);
    };

    const handleDelete = async (_modId: number) => {
        setIsLoading(true);
        // Simulate delete process
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    const filteredMods = mods.filter((mod) => {
        const matchesSearch =
            mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.author.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || mod.type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-4">
            <PageTitle title="Installed Mods" description="Manage your installed content" />

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search mods or authors..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMods.map((mod) => (
                    <Card key={mod.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm leading-tight flex-1">
                                    {mod.name}
                                </CardTitle>
                                {getTypeIcon(mod.type)}
                            </div>
                            <div className="space-y-1">
                                <CardDescription className="flex items-center gap-2 text-xs">
                                    <IconUser className="size-3" />
                                    {mod.author}
                                </CardDescription>
                                {mod.sizeOnDisk && (
                                    <div className="text-xs text-muted-foreground">{mod.sizeOnDisk}</div>
                                )}
                            </div>
                        </CardHeader>

                        <CardFooter className="pt-0 mt-auto">
                            <div className="flex gap-2 w-full">
                                {mod.hasUpdate ? (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 h-8"
                                        onClick={() => handleUpdate(mod.id)}
                                        disabled={isLoading}
                                    >
                                        <IconRefresh className="size-3 mr-1" />
                                        <span className="text-xs">
                                            {isLoading ? 'Updating...' : 'Update'}
                                        </span>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" className="flex-1 h-8" disabled>
                                        <span className="text-xs">Up to date</span>
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(mod.id)}
                                    disabled={isLoading}
                                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                                >
                                    <IconTrash className="size-3" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredMods.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        No mods found matching your search criteria.
                    </p>
                </div>
            )}
        </div>
    );
}

