import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Copy,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Check,
  Key,
  ExternalLink,
  Edit2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/sections/Navbar';
import { Footer } from '@/sections/Footer';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

interface APIKey {
  id: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

interface NewKeyData {
  key: string;
  key_id: string;
  name: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New key dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<NewKeyData | null>(null);

  // Delete confirmation state
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  // Edit state
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Show key state
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          setLocation('/login');
          return;
        }
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Failed to load API keys. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, setLocation]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreateKey = async () => {
    if (!token || !newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          setLocation('/login');
          return;
        }
        throw new Error('Failed to create API key');
      }

      const data: NewKeyData = await response.json();
      setNewKey(data);
      setNewKeyName('');
      await fetchApiKeys();

      toast({
        title: 'API Key Created',
        description: 'Your new API key has been generated successfully.',
      });
    } catch (err) {
      console.error('Error creating API key:', err);
      toast({
        title: 'Error',
        description: 'Failed to create API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!token || !keyToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/keys/${keyToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          setLocation('/login');
          return;
        }
        throw new Error('Failed to delete API key');
      }

      setApiKeys(prev => prev.filter(k => k.id !== keyToDelete));
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been revoked successfully.',
      });
    } catch (err) {
      console.error('Error deleting API key:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setKeyToDelete(null);
    }
  };

  const handleEditKey = async () => {
    if (!token || !editingKey || !editName.trim()) return;

    setIsEditing(true);
    try {
      const response = await fetch(`${API_URL}/api/keys/${editingKey.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          setLocation('/login');
          return;
        }
        throw new Error('Failed to update API key');
      }

      await fetchApiKeys();
      toast({
        title: 'API Key Updated',
        description: 'The API key name has been updated successfully.',
      });
    } catch (err) {
      console.error('Error updating API key:', err);
      toast({
        title: 'Error',
        description: 'Failed to update API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEditing(false);
      setEditingKey(null);
      setEditName('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your XMem API keys and account settings
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="bg-[#111] border-gray-800 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg text-white">Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-16 w-16 rounded-full border-2 border-gray-700"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{user?.name}</h3>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    {user?.username && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">@</span>
                        <span className="text-xs font-mono text-blue-400">{user.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Username</span>
                    <span className="text-white font-mono">
                      {user?.username ? `@${user.username}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Member since</span>
                    <span className="text-white">
                      {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last login</span>
                    <span className="text-white">
                      {user?.last_login ? formatDate(user.last_login) : 'Unknown'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* API Keys Card */}
            <Card className="bg-[#111] border-gray-800 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your API keys for accessing XMem services
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Key
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg">
                    <Key className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium text-white mb-2">No API Keys</h3>
                    <p className="text-gray-400 mb-4">
                      Create your first API key to start using XMem services
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white truncate">
                              {key.name}
                            </span>
                            <Badge
                              variant={key.is_active ? 'default' : 'secondary'}
                              className={key.is_active
                                ? 'bg-green-900/30 text-green-400 border-green-800'
                                : 'bg-gray-800 text-gray-400'
                              }
                            >
                              {key.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <code className="bg-gray-800 px-2 py-1 rounded text-gray-300">
                              {key.key_prefix}••••••••
                            </code>
                            <span>Created {formatDate(key.created_at)}</span>
                            {key.last_used && (
                              <span>Last used {formatDate(key.last_used)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                              setEditingKey(key);
                              setEditName(key.name);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => setKeyToDelete(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Key Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#111] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Give your API key a name to help you identify it later.
            </DialogDescription>
          </DialogHeader>

          {!newKey ? (
            <>
              <div className="py-4">
                <Input
                  placeholder="e.g., Production, Development, Testing"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isCreating}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-4 space-y-4">
                <Alert className="bg-yellow-900/20 border-yellow-800 text-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is the only time you'll see this API key. Copy it now!
                  </AlertDescription>
                </Alert>
                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-400 break-all font-mono">
                      {newKey.key}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(newKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setNewKey(null);
                    setIsCreateDialogOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Key Dialog */}
      <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
        <DialogContent className="bg-[#111] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the name of your API key.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="API Key Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingKey(null)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditKey}
              disabled={!editName.trim() || isEditing}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent className="bg-[#111] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
