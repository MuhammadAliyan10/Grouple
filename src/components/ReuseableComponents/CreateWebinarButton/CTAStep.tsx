import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebinarStore } from "@/store/useWebinarStore";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CtaTypeEnum } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Stripe from "stripe";

type Props = {
  assistants: any[];
  stripeProducts: Stripe.Product[] | [];
};

const CTAStep = ({ stripeProducts }: Props) => {
  const {
    formData,
    getStepValidationErrors,
    updateCTAField,
    addTag,
    removeTag,
  } = useWebinarStore();
  const { ctaLabel, ctaType, aiAgent, tags, priceId } = formData.cta;
  const errors = getStepValidationErrors("cta");
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateCTAField(name as keyof typeof formData.cta, value);
  };
  const handleSelectCTAType = (value: string) => {
    updateCTAField("ctaType", value as CtaTypeEnum);
  };
  const handleProductChange = (value: string) => {
    updateCTAField("priceId", value);
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="ctaLabel"
          className={errors.ctaLabel ? "text-red-400" : ""}
        >
          CTA label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="ctaLabel"
          name="ctaLabel"
          value={ctaLabel || ""}
          onChange={handleChange}
          placeholder="Enter label"
          className={cn(
            "bg-background/50 border border-input",
            errors.tags && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.ctaLabel && (
          <p className="text-sm text-red-400">{errors.ctaLabel}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="ctaLabel"
          className={errors.ctaLabel ? "text-red-400" : ""}
        >
          CTA label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Enter tags and press enter"
          className={cn(
            "bg-background/50 border border-input",
            errors.ctaLabel && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-md"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.ctaLabel && (
          <p className="text-sm text-red-400">{errors.ctaLabel}</p>
        )}
      </div>
      <div className="space-y-2 w-full">
        <Label>CTA Type</Label>
        <Tabs defaultValue={CtaTypeEnum.BOOK_A_CALL} className="w-full">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className="w-1/2 data-[state-active]:bg-background/50"
              onClick={() => {
                handleSelectCTAType(CtaTypeEnum.BOOK_A_CALL);
              }}
            >
              Book a Call
            </TabsTrigger>
            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className="w-1/2 data-[state-active]:bg-background/50"
              onClick={() => {
                handleSelectCTAType(CtaTypeEnum.BUY_NOW);
              }}
            >
              Buy Now
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="space-y-2">
        <Label>Attach an Product</Label>
        <div className="relative">
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search agents"
                className="pl-9 !bg-background/50 border border-input"
              />
            </div>
          </div>
          <Select value={priceId} onValueChange={handleProductChange}>
            <SelectTrigger className="w-full !bg-background/50 border border-input">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-input max-h-40">
              {stripeProducts?.length > 0 ? (
                stripeProducts.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.default_price?.toString() || ""}
                    className="!bg-background/50 hover:!bg-white/10"
                  >
                    {product.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="null" disabled>
                  Create product in stripe
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CTAStep;
