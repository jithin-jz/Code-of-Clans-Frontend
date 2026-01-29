import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { storeAPI } from '../services/api';
import { toast } from 'sonner';

// We need to add admin methods to storeAPI or create new ones. 
// Assuming storeAPI has standard CRUD or we use a new adminStoreAPI.
// For now, I'll assume we can add these to storeAPI or use axios directly if needed, 
// but sticking to patterns, let's extend api.js first or use a local helper.

import api from '../services/api';

const AdminStore = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: 100,
        category: 'THEME',
        icon_name: 'Palette',
        image: '',
        is_active: true,
        item_data: '{}'
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/store/items/');
            setItems(response.data);
        } catch (error) {
            toast.error("Failed to fetch items");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (item = null) => {
        if (item) {
            setCurrentItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                cost: item.cost,
                category: item.category,
                icon_name: item.icon_name,
                image: item.image || '',
                is_active: item.is_active,
                item_data: JSON.stringify(item.item_data || {}, null, 2)
            });
        } else {
            setCurrentItem(null);
            setFormData({
                name: '',
                description: '',
                cost: 100,
                category: 'THEME',
                icon_name: 'Palette',
                image: '',
                is_active: true,
                item_data: '{}'
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let parsedData;
            try {
                parsedData = JSON.parse(formData.item_data);
            } catch (err) {
                toast.error("Invalid JSON in Item Data");
                setSaving(false);
                return;
            }

            const payload = { ...formData, item_data: parsedData };

            if (currentItem) {
                await api.patch(`/store/items/${currentItem.id}/`, payload);
                toast.success("Item updated");
            } else {
                await api.post('/store/items/', payload);
                toast.success("Item created");
            }
            setIsDialogOpen(false);
            fetchItems();
        } catch (error) {
            toast.error("Failed to save item");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/store/items/${id}/`);
            toast.success("Item deleted");
            fetchItems();
        } catch (error) {
            toast.error("Failed to delete item");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white tracking-tight">Store Management</h2>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus size={16} /> Add Item
                </Button>
            </div>

            <div className="rounded-md border border-white/10 bg-[#0a0a0a]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-gray-400">Image</TableHead>
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Category</TableHead>
                            <TableHead className="text-gray-400">Cost</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    <Loader2 className="animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id} className="border-white/10 hover:bg-[#1a1a1a]">
                                    <TableCell>
                                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">
                                        {item.name}
                                        <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-white font-mono">{item.cost} XP</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                <Pencil size={16} className="text-gray-400 hover:text-white" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#09090b] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{currentItem ? 'Edit Item' : 'New Item'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="bg-black/50 border-white/10"
                                    required
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-sm"
                                >
                                    <option value="THEME">Theme</option>
                                    <option value="FONT">Font</option>
                                    <option value="EFFECT">Effect</option>
                                    <option value="VICTORY">Victory</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Description</label>
                             <Textarea 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="bg-black/50 border-white/10 h-20"
                            />
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cost (XP)</label>
                                <Input 
                                    type="number"
                                    value={formData.cost}
                                    onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})}
                                    className="bg-black/50 border-white/10"
                                    required
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Icon Name</label>
                                <Input 
                                    value={formData.icon_name}
                                    onChange={e => setFormData({...formData, icon_name: e.target.value})}
                                    className="bg-black/50 border-white/10"
                                    placeholder="e.g. Package, Palette"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-medium">Item Data (JSON)</label>
                             <Textarea 
                                value={formData.item_data}
                                onChange={e => setFormData({...formData, item_data: e.target.value})}
                                className="bg-black/50 border-white/10 h-24 font-mono text-xs"
                                placeholder='{"theme_key": "dracula"}'
                            />
                            <p className="text-xs text-gray-500">
                                Specific data for functional items (e.g. theme_key, front_family, effect_key, victory_key)
                            </p>
                        </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image</label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={formData.image}
                                        onChange={e => setFormData({...formData, image: e.target.value})}
                                        className="bg-black/50 border-white/10 flex-1"
                                        placeholder="/store/image.png"
                                    />
                                    <Input 
                                        type="file" 
                                        className="hidden" 
                                        id="image-upload"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            
                                            const uploadData = new FormData();
                                            uploadData.append('image', file);
                                            
                                            const toastId = toast.loading("Uploading image...");
                                            try {
                                                const res = await api.post('/store/upload/', uploadData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                setFormData(prev => ({ ...prev, image: res.data.url }));
                                                toast.success("Image uploaded!");
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Upload failed");
                                            } finally {
                                                toast.dismiss(toastId);
                                            }
                                        }}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => document.getElementById('image-upload').click()}
                                    >
                                        Upload
                                    </Button>
                                    </div>
                            </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Save Item
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminStore;
