import { useState } from "react"
import {
  IconServer,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDeviceFloppy,
  IconX,
  IconCopy,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ServerConfig {
  id: number
  name: string
  description: string
  serverName: string
  password: string
  adminPassword: string
  maxPlayers: number
  missionFile: string
  serverConfigFile: string
  additionalParams: string
  autoRestart: boolean
  restartIntervalHours: number
  isActive: boolean
  createdAt: string
}

export function ServerConfigEditor() {
  const [configs, setConfigs] = useState<ServerConfig[]>([
    {
      id: 1,
      name: "Main Production Server",
      description: "Primary Altis Life server configuration",
      serverName: "ARMA Life Server | 64 Slots | Active Admins",
      password: "",
      adminPassword: "admin123",
      maxPlayers: 64,
      missionFile: "Altis_Life.Altis",
      serverConfigFile: "server.cfg",
      additionalParams: "-enableHT -hugepages",
      autoRestart: true,
      restartIntervalHours: 6,
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Training Server",
      description: "Development and training environment",
      serverName: "Training Server | Whitelist Only",
      password: "training2024",
      adminPassword: "trainadmin",
      maxPlayers: 32,
      missionFile: "VR.VR",
      serverConfigFile: "server_training.cfg",
      additionalParams: "-noSound -world=empty",
      autoRestart: false,
      restartIntervalHours: 12,
      isActive: false,
      createdAt: "2024-01-10",
    },
  ])

  const [selectedConfig, setSelectedConfig] = useState<ServerConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<ServerConfig>>({})

  const handleEdit = (config: ServerConfig) => {
    setSelectedConfig(config)
    setFormData(config)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (selectedConfig && formData) {
      setConfigs(prev =>
        prev.map(c =>
          c.id === selectedConfig.id ? ({ ...c, ...formData } as ServerConfig) : c,
        ),
      )
      setIsEditing(false)
      setSelectedConfig({ ...selectedConfig, ...formData } as ServerConfig)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(selectedConfig || {})
  }

  const handleDelete = (id: number) => {
    setConfigs(prev => prev.filter(c => c.id !== id))
    if (selectedConfig?.id === id) {
      setSelectedConfig(null)
      setIsEditing(false)
    }
  }

  const handleDuplicate = (config: ServerConfig) => {
    const newConfig: ServerConfig = {
      ...config,
      id: Date.now(),
      name: `${config.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setConfigs(prev => [...prev, newConfig])
  }

  const handleCreateNew = () => {
    const newConfig: ServerConfig = {
      id: Date.now(),
      name: "New Server Config",
      description: "",
      serverName: "New ARMA Server",
      password: "",
      adminPassword: "",
      maxPlayers: 64,
      missionFile: "",
      serverConfigFile: "server.cfg",
      additionalParams: "",
      autoRestart: false,
      restartIntervalHours: 6,
      isActive: false,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setConfigs(prev => [...prev, newConfig])
    setSelectedConfig(newConfig)
    setFormData(newConfig)
    setIsEditing(true)
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="flex h-screen">
      {/* Server Configs Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Server Configurations</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Server Configuration</DialogTitle>
                  <DialogDescription>
                    Create a new server configuration from scratch.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={handleCreateNew}>Create Configuration</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {configs.map(config => (
              <button
                key={config.id}
                onClick={() => setSelectedConfig(config)}
                className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-accent ${
                  selectedConfig?.id === config.id
                    ? "bg-accent border border-border"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <IconServer className="size-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{config.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {config.description || "No description"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {config.isActive && (
                      <div className="size-2 rounded-full bg-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-6 p-0"
                      onClick={e => {
                        e.stopPropagation()
                        handleDuplicate(config)
                      }}
                    >
                      <IconCopy className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-6 p-0"
                      onClick={e => {
                        e.stopPropagation()
                        handleDelete(config.id)
                      }}
                    >
                      <IconTrash className="size-3" />
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedConfig ? (
          <>
            {/* Server Config Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <IconServer className="size-6" />
                    <h1 className="text-2xl font-bold">{selectedConfig.name}</h1>
                    {selectedConfig.isActive && (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {selectedConfig.description || "No description"}
                  </p>
                </div>
                {!isEditing && (
                  <Button onClick={() => handleEdit(selectedConfig)}>
                    <IconEdit className="size-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {/* Server Config Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Configuration Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPlayers">Max Players</Label>
                        <Input
                          id="maxPlayers"
                          type="number"
                          value={formData.maxPlayers || 64}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              maxPlayers: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Optional description of this server configuration"
                      />
                    </div>

                    <div>
                      <Label htmlFor="serverName">Server Name (in browser)</Label>
                      <Input
                        id="serverName"
                        value={formData.serverName || ""}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            serverName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Server Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password || ""}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          placeholder="Leave empty for no password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminPassword">Admin Password</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          value={formData.adminPassword || ""}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              adminPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="missionFile">Mission File</Label>
                        <Select
                          value={formData.missionFile || ""}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, missionFile: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Altis_Life.Altis">Altis Life</SelectItem>
                            <SelectItem value="King_of_the_Hill.Altis">
                              King of the Hill
                            </SelectItem>
                            <SelectItem value="VR.VR">VR Training</SelectItem>
                            <SelectItem value="Stratis.Stratis">
                              Stratis Default
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="serverConfigFile">Server Config File</Label>
                        <Input
                          id="serverConfigFile"
                          value={formData.serverConfigFile || ""}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              serverConfigFile: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalParams">Additional Parameters</Label>
                      <Textarea
                        id="additionalParams"
                        value={formData.additionalParams || ""}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            additionalParams: e.target.value,
                          }))
                        }
                        placeholder="e.g., -enableHT -hugepages -noSound"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="autoRestart" className="text-base font-medium">
                          Auto Restart
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically restart the server at regular intervals
                        </p>
                      </div>
                      <Switch
                        id="autoRestart"
                        checked={formData.autoRestart || false}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, autoRestart: checked }))
                        }
                      />
                    </div>

                    {formData.autoRestart && (
                      <div>
                        <Label htmlFor="restartInterval">
                          Restart Interval (hours)
                        </Label>
                        <Input
                          id="restartInterval"
                          type="number"
                          value={formData.restartIntervalHours || 6}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              restartIntervalHours: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSave}>
                        <IconDeviceFloppy className="size-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <IconX className="size-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Server Name</Label>
                        <p className="text-sm">{selectedConfig.serverName}</p>
                      </div>
                      <div>
                        <Label>Max Players</Label>
                        <p className="text-sm">{selectedConfig.maxPlayers}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Mission File</Label>
                      <p className="text-sm">
                        {selectedConfig.missionFile || "Not set"}
                      </p>
                    </div>

                    <div>
                      <Label>Auto Restart</Label>
                      <p className="text-sm">
                        {selectedConfig.autoRestart
                          ? `Yes, every ${selectedConfig.restartIntervalHours} hours`
                          : "No"}
                      </p>
                    </div>

                    {selectedConfig.additionalParams && (
                      <div>
                        <Label>Additional Parameters</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                          {selectedConfig.additionalParams}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <IconServer className="size-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a configuration to view details</p>
              <p className="text-sm">
                Choose a server configuration from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
