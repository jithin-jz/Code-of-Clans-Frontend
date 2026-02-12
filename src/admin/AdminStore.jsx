import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { notify } from "../services/notification";

// We need to add admin methods to storeAPI or create new ones.
// Assuming storeAPI has standard CRUD or we use a new adminStoreAPI.
// For now, I'll assume we can add these to storeAPI or use axios directly if needed,
// but sticking to patterns, let's extend api.js first or use a local helper.

import api from "../services/api";

const AdminStore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: 100,
    category: "THEME",
    icon_name: "Palette",
    image: "",
    is_active: true,
    item_data: "{}",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("/store/items/");
      setItems(response.data);
    } catch {
      notify.error("Failed to fetch store items");
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
        image: item.image || "",
        is_active: item.is_active,
        item_data: JSON.stringify(item.item_data || {}, null, 2),
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: "",
        description: "",
        cost: 100,
        category: "THEME",
        icon_name: "Palette",
        image: "",
        is_active: true,
        item_data: "{}",
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
      } catch {
        notify.error("Invalid JSON configuration");
        setSaving(false);
        return;
      }

      const payload = { ...formData, item_data: parsedData };

      if (currentItem) {
        await api.patch(`/store/items/${currentItem.id}/`, payload);
        notify.success("Item updated");
      } else {
        await api.post("/store/items/", payload);
        notify.success("Item created");
      }
      setIsDialogOpen(false);
      fetchItems();
    } catch {
      notify.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    notify.warning("Delete Item", {
      description:
        "Are you sure you want to delete this item? This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => confirmDelete(id),
      },
    });
  };

  const confirmDelete = async (id) => {
    try {
      await api.delete(`/store/items/${id}/`);
      notify.success("Item deleted");
      fetchItems();
    } catch {
      notify.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Store Management
        </h2>
        <Button
          onClick={() => handleOpenDialog()}
          className="h-8 gap-2 bg-white text-black hover:bg-zinc-200 font-medium px-3 rounded-md transition-colors"
        >
          <Plus size={16} />
          <span className="text-xs">Add Item</span>
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
              <TableHead className="w-[80px] text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3 px-6">
                Icon
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Item Details
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Category
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Price
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-700" />
                    <span className="text-xs font-medium text-zinc-600 uppercase tracking-widest">
                      Loading...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors group"
                >
                  <TableCell className="py-3 px-6">
                    <div className="w-10 h-10 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={18} className="text-zinc-700" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white tracking-tight">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 line-clamp-1">
                        {item.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className="bg-zinc-900 border-zinc-800 text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md text-zinc-400"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 font-mono text-xs text-zinc-400">
                    {item.cost} XP
                  </TableCell>
                  <TableCell className="text-right py-3 px-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-md"
                      >
                        <Trash2 size={16} />
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
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {currentItem ? "Edit Item" : "New Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-zinc-900 border-zinc-800 h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
                >
                  <option value="THEME">Theme</option>
                  <option value="FONT">Font</option>
                  <option value="EFFECT">Effect</option>
                  <option value="VICTORY">Victory</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-zinc-900 border-zinc-800 h-20 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">
                  Cost (XP)
                </label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: parseInt(e.target.value) })
                  }
                  className="bg-zinc-900 border-zinc-800 h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">
                  Icon Name
                </label>
                <Input
                  value={formData.icon_name}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_name: e.target.value })
                  }
                  className="bg-zinc-900 border-zinc-800 h-9 text-sm"
                  placeholder="e.g. Palette"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Configuration (JSON)
              </label>
              <Textarea
                value={formData.item_data}
                onChange={(e) =>
                  setFormData({ ...formData, item_data: e.target.value })
                }
                className="bg-zinc-900 border-zinc-800 h-24 font-mono text-[10px] resize-none"
                placeholder='{"theme_key": "dracula"}'
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Asset URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="bg-zinc-900 border-zinc-800 h-9 text-sm flex-1"
                  placeholder="/assets/item.png"
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
                    uploadData.append("image", file);

                    const toastId = notify.loading("Uploading...");
                    try {
                      const res = await api.post("/store/upload/", uploadData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      setFormData((prev) => ({ ...prev, image: res.data.url }));
                      notify.success("Uploaded");
                    } catch {
                      notify.error("Upload failed");
                    } finally {
                      notify.dismiss(toastId);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
                >
                  Upload
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-zinc-500 hover:text-white h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-white text-black hover:bg-zinc-200 h-9 font-medium px-6"
              >
                {saving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Save Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStore;
