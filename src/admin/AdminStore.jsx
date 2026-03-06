import React, { useEffect, useMemo, useState } from "react";
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
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { notify } from "../services/notification";
import { AdminTableLoadingRow } from "./AdminSkeletons";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
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

      <div className="rounded-lg border border-white/5 bg-[#0a0a0a] shadow-sm overflow-hidden">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.02]">
              <TableHead className="w-[80px] text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3 px-6">
                Icon
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Item Details
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Category
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Price
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(6)].map((_, i) => <AdminTableLoadingRow key={i} colSpan={5} />)
            ) : (
              paginatedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-white/10 hover:bg-white/5 transition-colors group"
                >
                  <TableCell className="py-3 px-6">
                    <div className="w-10 h-10 bg-white/[0.04] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={18} className="text-neutral-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-100 tracking-tight">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-neutral-500 line-clamp-1">
                        {item.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className="bg-white/[0.04]/60 border-white/10 text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md text-neutral-300"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 font-mono text-xs text-neutral-300">
                    {item.cost} XP
                  </TableCell>
                  <TableCell className="text-right py-3 px-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-md"
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
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-neutral-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/10"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-neutral-400">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/10"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-[calc(100vw-2rem)] sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-100">
              {currentItem ? "Edit Item" : "New Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-white/[0.04] border-white/10 h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  <option value="THEME">Theme</option>
                  <option value="FONT">Font</option>
                  <option value="EFFECT">Effect</option>
                  <option value="VICTORY">Victory</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white/[0.04] border-white/10 h-20 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Cost (XP)
                </label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: parseInt(e.target.value) })
                  }
                  className="bg-white/[0.04] border-white/10 h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Icon Name
                </label>
                <Input
                  value={formData.icon_name}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_name: e.target.value })
                  }
                  className="bg-white/[0.04] border-white/10 h-9 text-sm"
                  placeholder="e.g. Palette"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Configuration (JSON)
              </label>
              <Textarea
                value={formData.item_data}
                onChange={(e) =>
                  setFormData({ ...formData, item_data: e.target.value })
                }
                className="bg-white/[0.04] border-white/10 h-24 font-mono text-[10px] resize-none"
                placeholder='{"theme_key": "dracula"}'
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Asset URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="bg-white/[0.04] border-white/10 h-9 text-sm flex-1"
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
                  className="h-9 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/10"
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
                className="text-neutral-400 hover:text-white hover:bg-white/10 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-white text-black hover:bg-zinc-200 h-9 font-medium px-6"
              >
                {saving ? "Saving..." : "Save Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStore;
