/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, Calendar, X,Trash2 } from "lucide-react"; 
import { getChildMedia, uploadChildMedia,deleteChildMedia } from "@/services/media.services";
import Image from "next/image";

export default function ChildGallery({ 
  childId, 
  currentUserRole 
}: { 
  childId: string;
  currentUserRole: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
 
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const isStaff = ["TEACHER", "CENTER_ADMIN", "TENANT_OWNER", "SUPER_ADMIN"].includes(currentUserRole);

  const { data: mediaResponse, isLoading } = useQuery({
    queryKey: ["child-media", childId],
    queryFn: () => getChildMedia(childId),
  });

  const mediaList = mediaResponse?.data || [];

  const { mutate: upload, isPending } = useMutation({
    mutationFn: (formData: FormData) => uploadChildMedia(childId, formData),
    onSuccess: () => {
      toast.success("Photo added to gallery!");
      setPreview(null);
      setCaption("");
      queryClient.invalidateQueries({ queryKey: ["child-media", childId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload photo.");
    },
  });
  const { mutate: deleteMedia, isPending: isDeleting } = useMutation({
    mutationFn: (mediaId: string) => deleteChildMedia(mediaId),
    onSuccess: () => {
      toast.success("Photo deleted.");
      setSelectedImage(null);
      queryClient.invalidateQueries({ queryKey: ["child-media", childId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete photo.");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }
    setPreview({ file, url: URL.createObjectURL(file) });
  };

  const handleUpload = () => {
    if (!preview) return;
    const formData = new FormData();
    formData.append("file", preview.file);
    if (caption) formData.append("caption", caption);
    upload(formData);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section for Staff */}
      {isStaff && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 hover:border-primary/50 hover:text-primary transition-all cursor-pointer"
            >
              <ImagePlus className="size-8 mb-3 opacity-80" />
              <p className="font-medium text-sm">Click to upload a photo</p>
              <p className="text-xs opacity-70 mt-1">PNG, JPG up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="relative w-full sm:w-48 aspect-square rounded-lg overflow-hidden border border-border shrink-0">
                <Image src={preview.url} alt="Preview" fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g., Painting session during art class!"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isPending}
                  />
                </div>
                <div className="flex items-center gap-3 self-end sm:self-start pt-2">
                  <button
                    onClick={() => setPreview(null)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    {isPending ? "Uploading..." : "Save to Gallery"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
      ) : mediaList.length === 0 ? (
        <div className="text-center p-12 border border-border border-dashed rounded-xl bg-card/50">
          <ImagePlus className="size-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium text-foreground">No photos yet</p>
          <p className="text-sm text-muted-foreground mt-1">Moments captured by teachers will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((media: any) => (
            <div 
              key={media.id} 
              onClick={() => setSelectedImage(media)} // <-- Added Click Handler
              className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer"
            >
              <Image src={media.url} alt={media.caption || "Child moment"} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                {media.caption && <p className="text-xs text-white font-medium line-clamp-2 mb-1.5">{media.caption}</p>}
                <div className="flex items-center justify-between text-[10px] text-white/80">
                  <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(media.createdAt).toLocaleDateString()}</span>
                  <span>{media.uploader?.name.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
            {(selectedImage.uploadedBy === currentUserRole || isStaff) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toast.error("Delete this photo?", {
                    description: "This action cannot be undone.",
                    action: {
                      label: "Yes, delete",
                      onClick: () => deleteMedia(selectedImage.id),
                    },
                    cancel: {
                      label: "Cancel",
                      onClick: () => {},
                    },
                  });
                }}
                disabled={isDeleting}
                className="p-2 text-red-400 hover:text-red-300 transition-colors bg-white/10 hover:bg-white/20 rounded-full focus:outline-none disabled:opacity-50"
                title="Delete Photo"
              >
                {isDeleting ? <Loader2 className="size-6 animate-spin" /> : <Trash2 className="size-6" />}
              </button>
            )}

            <button 
              onClick={() => setSelectedImage(null)}
              className="p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full focus:outline-none"
            >
              <X className="size-6" />
            </button>
          </div>
          
          <div 
            className="relative w-full max-w-5xl flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[60vh] sm:h-[75vh]">
              <Image 
                src={selectedImage.url} 
                alt={selectedImage.caption || "Full view"} 
                fill 
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
            
            <div className="mt-6 w-full max-w-2xl text-center">
              {selectedImage.caption && (
                <p className="text-white text-base sm:text-lg font-medium tracking-wide">
                  {selectedImage.caption}
                </p>
              )}
              <div className="mt-2 flex items-center justify-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> 
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </span>
                <span className="size-1 rounded-full bg-white/30"></span>
                <span>Added by {selectedImage.uploader?.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}