"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Fund } from "@/lib/db";
import { ArrowDown, ArrowUp, Check, DollarSign, Edit, Trash2, X } from "lucide-react";
import { useState } from "react";

interface FundItemProps {
  fund: Fund;
  onUpdate: (id: string, updates: Partial<Fund>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  loading?: boolean;
  deleting?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function FundItem({
  fund,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  loading = false,
  deleting = false,
  canMoveUp,
  canMoveDown,
}: FundItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(fund.title);
  const [editPrice, setEditPrice] = useState(fund.price);

  const formatPrice = (price: string) => {
    // Remove commas for calculation, but keep decimals
    const numericValue = parseFloat(price.replace(/,/g, ''));
    if (isNaN(numericValue)) return price;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatPriceInput = (value: string) => {
    // Only allow digits, commas, and one decimal point
    let cleaned = value.replace(/[^\d,\.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPriceInput(value);
    setEditPrice(formatted);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editPrice.trim()) return;
    
    // Validate that price contains only valid characters
    if (!/^[\d,\.]+$/.test(editPrice.trim())) return;

    onUpdate(fund.id, {
      title: editTitle.trim(),
      price: editPrice.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(fund.title);
    setEditPrice(fund.price);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditTitle(fund.title);
    setEditPrice(fund.price);
    setIsEditing(true);
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        deleting ? "opacity-50 pointer-events-none" : ""
      } ${isHovered ? "shadow-md" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="px-5">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-sm"
                  placeholder="Product title..."
                />
                <div className="relative">
                  <Input
                    value={editPrice}
                    onChange={handlePriceChange}
                    className="pr-12 text-sm"
                    placeholder="0"
                  />
                  <div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-muted-foreground text-xs">VND</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm truncate">{fund.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-mono font-semibold text-green-600 dark:text-green-400 text-base">
                    {formatPrice(fund.price)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div
            className={`flex gap-1 transition-opacity duration-200 ${
              isHovered || isEditing ? "opacity-100" : "opacity-0"
            }`}
          >
            {isEditing ? (
              <>
                {/* Save */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 w-8 h-8 text-green-600 hover:text-green-700"
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || !editPrice.trim() || !/^[\d,\.]+$/.test(editPrice.trim()) || loading}
                  title="Save changes"
                >
                  <Check className="w-3 h-3" />
                </Button>

                {/* Cancel */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 w-8 h-8 text-gray-600 hover:text-gray-700"
                  onClick={handleCancelEdit}
                  title="Cancel editing"
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                {/* Edit */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 w-8 h-8"
                  onClick={handleEditClick}
                  disabled={loading || deleting}
                  title="Edit fund goal"
                >
                  <Edit className="w-3 h-3" />
                </Button>

                {/* Move up */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 w-8 h-8"
                  onClick={() => onMoveUp(fund.id)}
                  disabled={!canMoveUp || loading}
                  title="Move up"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>

                {/* Move down */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 w-8 h-8"
                  onClick={() => onMoveDown(fund.id)}
                  disabled={!canMoveDown || loading}
                  title="Move down"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/10 p-0 w-8 h-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(fund.id)}
                  disabled={deleting || loading}
                  title="Delete fund goal"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
