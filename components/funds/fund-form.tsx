"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

interface FundFormProps {
  onSubmit: (fund: {
    title: string;
    price: string;
  }) => void;
  loading?: boolean;
}

export function FundForm({ onSubmit, loading }: FundFormProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    // Validate that price contains only valid characters
    if (!/^[\d,\.]+$/.test(price.trim())) return;

    onSubmit({
      title: title.trim(),
      price: price.trim(),
    });

    // Reset form
    setTitle("");
    setPrice("");
    setIsOpen(false);
  };

  const formatVND = (value: string) => {
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
    const formatted = formatVND(value);
    setPrice(formatted);
  };

  const getPriceDisplayValue = () => {
    if (!price) return '';
    // Remove commas for calculation, but keep decimals
    const numericValue = parseFloat(price.replace(/,/g, ''));
    return isNaN(numericValue) ? '' : numericValue.toLocaleString('vi-VN');
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="justify-center gap-2 border-b-2 w-full"
        size="lg"
        variant="ghost"
      >
        <Plus className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Fund Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Product title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
              required
            />
          </div>
          
          <div>
            <div className="relative">
              <Input
                placeholder="0"
                value={price}
                onChange={handlePriceChange}
                className="pr-12 text-lg"
                required
              />
              <div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
                <span className="text-muted-foreground text-sm">VND</span>
              </div>
            </div>
            {price && (
              <p className="mt-1 text-muted-foreground text-sm">
                {getPriceDisplayValue()} VND
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={!title.trim() || !price.trim() || !/^[\d,\.]+$/.test(price.trim()) || loading} 
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Fund Goal"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
